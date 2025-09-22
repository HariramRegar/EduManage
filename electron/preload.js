const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('edumanage', {
  version: '1.0.0',
});
