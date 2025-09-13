import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../contexts/theme.context';
import { usePublications } from '../../contexts/publication.context';
import PublicationCard from '../../components/publication/publication-card.component';
import PublicationSkeleton from '../../components/ui/publication-skeleton.component';

import { PublicationModelResponse } from '../../../domain/models/publication.models';
import { PublicationStatus } from '../../../services/publication/publication.service';

const ITEM_HEIGHT = 280;

const PublicationScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, actions } = usePublications();

  const [selectedStatus, setSelectedStatus] = useState<PublicationStatus>(
    PublicationStatus.PENDING
  );
  const listRef = useRef<FlatList<PublicationModelResponse>>(null);

  // Get current status data
  const currentStatusData = state[selectedStatus];
  const publications = currentStatusData.filteredPublications;
  const isLoading = currentStatusData.isLoading;
  const isLoadingMore = currentStatusData.isLoadingMore;
  const pagination = currentStatusData.pagination;

  const handleStatusChange = useCallback(
    (status: PublicationStatus) => {
      setSelectedStatus(status);
      // Forzar refresh al cambiar tabs para sincronizar con backend
      actions.loadStatus(status, { forceRefresh: true });
    },
    [actions]
  );

  const handleRefresh = useCallback(() => {
    actions.loadStatus(selectedStatus, { forceRefresh: true });
  }, [actions, selectedStatus]);

  const handleLoadMore = useCallback(() => {
    // Check if we can load more (respects circuit breaker)
    if (pagination.hasNext && !isLoadingMore) {
      actions.loadMoreStatus(selectedStatus);
    }
  }, [actions, selectedStatus, pagination.hasNext, isLoadingMore]);

  const renderItem = useCallback(
    ({ item }: { item: PublicationModelResponse }) => (
      <PublicationCard
        publication={item}
        status={selectedStatus}
        viewMode="card"
      />
    ),
    [selectedStatus]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }, [isLoadingMore, theme.colors.primary]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <PublicationSkeleton key={index} viewMode="card" />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No hay publicaciones disponibles
        </Text>
      </View>
    );
  }, [isLoading, theme.colors.textSecondary]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index
    }),
    []
  );

  useEffect(() => {
    actions.loadStatus(selectedStatus);
  }, [actions, selectedStatus]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <StatusTabs
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
        />
      </View>

      <FlatList
        ref={listRef}
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          `${selectedStatus}-${item.recordId?.toString() || index}-${index}`
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const StatusTabs: React.FC<{
  selectedStatus: PublicationStatus;
  onStatusChange: (status: PublicationStatus) => void;
}> = ({ selectedStatus, onStatusChange }) => {
  const { theme } = useTheme();

  const statusOptions = [
    { label: 'Pendientes', value: PublicationStatus.PENDING },
    { label: 'Aceptadas', value: PublicationStatus.ACCEPTED },
    { label: 'Rechazadas', value: PublicationStatus.REJECTED }
  ];

  return (
    <View style={styles.tabsContainer}>
      {statusOptions.map(option => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onStatusChange(option.value)}
          style={[
            styles.tab,
            selectedStatus === option.value && [
              styles.activeTab,
              { backgroundColor: theme.colors.primary }
            ]
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.colors.text },
              selectedStatus === option.value && [
                styles.activeTabText,
                { color: theme.colors.background }
              ]
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5'
  },
  activeTab: {
    borderColor: 'transparent'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500'
  },
  activeTabText: {
    fontWeight: '600'
  }
});

export default PublicationScreen;
