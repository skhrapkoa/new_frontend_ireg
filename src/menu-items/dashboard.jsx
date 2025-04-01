// third-party
import { FormattedMessage } from 'react-intl';

// project import

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import GoldOutlined from '@ant-design/icons/GoldOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

// type

// Удаляем импорт API, чтобы избежать запросов
// import { useGetMenu } from 'api/menu';

const icons = { dashboard: DashboardOutlined, components: GoldOutlined, loading: LoadingOutlined };

const invoiceItem = { id: 'invoice1', title: 'Invoice', type: 'item', url: '/dashboard/invoice', breadcrumbs: false };

const loadingMenu = {
  id: 'group-dashboard-loading',
  title: <FormattedMessage id="dashboard" />,
  type: 'group',
  icon: icons.loading,
  children: [
    {
      id: 'dashboard1',
      title: <FormattedMessage id="dashboard" />,
      type: 'collapse',
      icon: icons.loading,
      children: [
        {
          id: 'default1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/default',
          breadcrumbs: false
        },
        {
          id: 'analytics1',
          title: 'loading',
          type: 'item',
          url: '/dashboard/analytics',
          breadcrumbs: false
        },
        invoiceItem
      ]
    }
  ]
};

const defaultMenu = {
  id: 'group-dashboard',
  title: <FormattedMessage id="dashboard" />,
  type: 'group',
  icon: icons.dashboard,
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'collapse',
      icon: icons.dashboard,
      children: [invoiceItem]
    }
  ]
};

// ==============================|| MENU ITEMS - API ||============================== //

export function MenuFromAPI() {
  // Всегда возвращаем статический объект меню
  return defaultMenu;
}

// Удаляем ненужные функции, которые работали с API
/*
function fillItem(item, children) {
  return {
    ...item,
    title: <FormattedMessage id={`${item?.title}`} />,
    // @ts-ignore
    icon: icons[item?.icon],
    ...(children && { children })
  };
}
*/
