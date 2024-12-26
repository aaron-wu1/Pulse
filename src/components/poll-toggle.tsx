import { Button } from './ui/button';
import { usePolling } from './polling-provider';
export function PollToggle() {
  const { isPollingEnabled, setIsPollingEnabled } = usePolling();
  return (
    <Button
      onClick={() => {
        setIsPollingEnabled(!isPollingEnabled);
      }}
    >
      Change polling, currently {isPollingEnabled ? 'enabled' : 'disabled'}
    </Button>
  );
}
