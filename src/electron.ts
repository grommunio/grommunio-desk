const { app, BrowserWindow } = require('electron');

const isProduction = process.env.NODE_ENV === 'production';

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // TODO: research about security
      contextIsolation: false,
    }
  });

  isProduction ? win.loadFile('index.html') : win.loadURL("http://localhost:8080/");
  console.log("Production:", isProduction);
}
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their 
    // menu bar to stay active until the user quits 
    // explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the 
    // app when the dock icon is clicked and there are no 
    // other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

