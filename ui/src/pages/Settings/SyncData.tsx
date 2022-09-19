import BuildingMode from '@/components/BuildingMode';
import Card from '@/components/Card';
import { useIntl } from 'umi';

const SyncData = () => {
  const intl = useIntl();
  return (
    <Card cardTitle={intl.formatMessage({ id: 'settings.sync-data' })}>
      <BuildingMode />
    </Card>
  );
};

export default SyncData;
