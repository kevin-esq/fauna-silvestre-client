import { navigationRef } from '../../presentation/navigation/navigation-ref';

export const NavigateReset = (routeName: string) => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: routeName }]
  });
};

export const Navigate = (routeName: string) =>
  navigationRef.current?.navigate(routeName as never);
