import { Menu, MenuItem, Submenu } from '@tauri-apps/api/menu';
import { invoke } from '@tauri-apps/api/core';

const fileSubmenu = await Submenu.new({
  text: 'File',
  items: [
    await MenuItem.new({
      id: 'new',
      text: 'New',
      action: () => {
        console.log('New clicked');
      },
    }),
    await MenuItem.new({
      id: 'open',
      text: 'Open',
      action: () => {
        console.log('Open clicked');
      },
    }),
    await MenuItem.new({
      id: 'save_as',
      text: 'Save As...',
      action: () => {
        console.log('Save As clicked');
      },
    }),
  ],
});

const rateSubmenu = await Submenu.new({
  text: 'Rate',
  items: [
    await MenuItem.new({
      id: '1',
      text: '1 sec',
      action: () => {
        console.log('Set rate to 1');
        invoke('update_rate', { newRate: 1000 });
      },
    }),
    await MenuItem.new({
      id: '2',
      text: '2 sec',
      action: () => {
        console.log('Set rate to 2');
        invoke('update_rate', { newRate: 2000 });
      },
    }),
    await MenuItem.new({
      id: '5',
      text: '5 sec',
      action: () => {
        console.log('Set rate to 5');
        invoke('update_rate', { newRate: 5000 });
      },
    }),
    await MenuItem.new({
      id: '10',
      text: '10 sec',
      action: () => {
        console.log('Set rate to 10');
        invoke('update_rate', { newRate: 10000 });
      },
    }),
  ],
});

const viewSubmenu = await Submenu.new({
  text: 'View',
  items: [rateSubmenu],
});

const menu = await Menu.new({
  items: [
    fileSubmenu,
    viewSubmenu,
    await MenuItem.new({
      id: 'quit',
      text: 'Quit',
      action: () => {
        console.log('Quit pressed');
      },
    }),
  ],
});

export default menu;
