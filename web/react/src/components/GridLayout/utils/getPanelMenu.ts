import { PanelMenuItem } from '@/core/types/panel';
import { DashboardModel } from '@/core/dashboard/dashboard_model';
import { PanelModel } from '@/core/dashboard/panel_model';

export const getPanelMenu = (dashboard: DashboardModel, panel: PanelModel) => {
  const onViewPanel = () => {
    dashboard.setViewMode(panel, true, false);
  };

  const onEditPanel = () => {
    dashboard.setViewMode(panel, false, false);
  };

  const onSharePanel = () => {
    // sharePanel(dashboard, panel);
  };

  const onDuplicatePanel = () => {
    // duplicatePanel(dashboard, panel);
  };

  const onCopyPanel = () => {
    // copyPanel(panel);
  };

  const onEditPanelJson = () => {
    // editPanelJson(dashboard, panel);
  };

  const onRemovePanel = () => {
    // removePanel(dashboard, panel, true);
  };

  const menu: PanelMenuItem[] = [];

  menu.push({
    text: 'View',
    iconClassName: 'fa fa-fw fa-eye',
    onClick: onViewPanel,
    shortcut: 'v',
  });

  if (dashboard.meta.canEdit) {
    menu.push({
      text: 'Edit',
      iconClassName: 'fa fa-fw fa-edit',
      onClick: onEditPanel,
      shortcut: 'e',
    });
  }

  menu.push({
    text: 'Share',
    iconClassName: 'fa fa-fw fa-share',
    onClick: onSharePanel,
    shortcut: 'p s',
  });

  const subMenu: PanelMenuItem[] = [];

  if (!panel.fullscreen && dashboard.meta.canEdit) {
    subMenu.push({
      text: 'Duplicate',
      onClick: onDuplicatePanel,
      shortcut: 'p d',
    });

    subMenu.push({
      text: 'Copy',
      onClick: onCopyPanel,
    });
  }

  subMenu.push({
    text: 'Panel JSON',
    onClick: onEditPanelJson,
  });

  menu.push({
    type: 'submenu',
    text: 'More...',
    iconClassName: 'fa fa-fw fa-cube',
    subMenu: subMenu,
  });

  if (dashboard.meta.canEdit) {
    menu.push({ type: 'divider' });

    menu.push({
      text: 'Remove',
      iconClassName: 'fa fa-fw fa-trash',
      onClick: onRemovePanel,
      shortcut: 'p r',
    });
  }

  return menu;
};
