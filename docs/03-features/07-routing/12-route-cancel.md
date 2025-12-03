### Method `cancel` for Navigation Control

The `cancel` method allows you to cancel navigation actions at different stages of their lifecycle. This can be useful when you need to interrupt a transition to a new route or cancel an update of the current route.

#### Usage

```ts
export function useBlockBackExitFromPage({ action }: { action: (navigation: Navigation) => void }) {
  const router = useDi(ROUTER_TOKEN);

  const actionRef = useRef(action);

  actionRef.current = action;

  useEffect(() => {
    return router.registerHook('beforeResolve', async (navigation) => {
      if (!navigation.isBack) {
        return;
      }

      router.cancel(navigation);
      await router.forward();

      actionRef.current(navigation);
    });
  }, [router]);
}

```

#### Parameters

- `cancel(navigation?: Navigation)` — an optional parameter specifying the exact navigation to cancel. Note that in the `beforeResolve` hook, the `navigation` parameter is required when calling `cancel`.

#### Stages Where `cancel` Can Be Used

You can call the `cancel` method at the following stages:

##### Navigation
- **`beforeResolve`** — the stage before navigation starts, when the router hasn’t yet begun processing the new path. Calling `cancel` at this stage will prevent navigation from starting.
- **`guards`** -— the stage when the guards are being executed. Calling `cancel` at this stage will prevent navigation from starting.
- **`beforeNavigate`** — the stage when navigation has started and spa commandline has started but has not yet completed. Calling `cancel` at this stage will stop the transition.

##### Update
- **`beforeUpdateCurrent`** — the stage of updating the current route. The `cancel` method can be used to interrupt the update.


#### Use Cases

- Cancel navigation based on user input (e.g., if the user closes a confirmation modal).
- Interrupt navigation if a validation step fails (e.g., the user doesn’t have permissions to proceed).
- Interrupt back navigation to redirect the user to an available flow (e.g., when the user tries to go back to a restricted page and should be redirected instead).

#### See Also

- [`Hooks and Guards`](https://tramvai.dev/docs/features/routing/hooks-and-guards)
