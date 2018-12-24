import { PanelMenuItem } from '@/core/types/panel';
import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';
import { Modal } from 'antd';

export const getPanelMenu = (dashboard: DashboardModel, panel: PanelModel) => {
  const onViewPanel = () => {
    dashboard.setViewMode(panel, true, false);
  };

  const onEditPanel = () => {
    dashboard.setViewMode(panel, true, true);
  };

  const onRemovePanel = () => {
    Modal.confirm({
      title: '删除面板',
      content: '确定删除面板吗？',
      onOk: () => {
        dashboard.removePanel(panel);
      },
      okText: '确认',
      cancelText: '取消',
    });
    // removePanel(dashboard, panel, true);
  };

  const menu: PanelMenuItem[] = [];

  menu.push({
    text: 'View',
    iconClassName: 'fa fa-fw fa-eye',
    onClick: onViewPanel,
  });

  if (dashboard.meta.canEdit) {
    menu.push({
      text: 'Edit',
      iconClassName: 'fa fa-fw fa-edit',
      onClick: onEditPanel,
    });
  }

  if (dashboard.meta.canEdit) {
    menu.push({ type: 'divider' });

    menu.push({
      text: 'Remove',
      iconClassName: 'fa fa-fw fa-trash',
      onClick: onRemovePanel,
    });
  }

  return menu;
};
