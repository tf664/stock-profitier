# Stock-Profitier

<div align="center">
<!-- 
  <img src="static\RetroMorseTranslatorIcon.png" alt="App Icon" width="120" />
-->
Icon
</div>

---

## About

Stock Profitier is a lightweight Android app that lets you easily track your stock trading profits without relying on a broker.
With Stock Profitier, you manually enter when you buy and sell stocks, allowing you to view a graphical overview and detailed insights into your overall trading performance.

_This project was made without heavily relying on AI coding to avoid becoming a vibe coder #aiisgonnatakeovertheworld_

This and the wish to create a bit more complicated svelte android app with database while also trying out the flowbite chart library was the inspiration to create Stock Profitier


<div align="center">
  <!-- Placeholder for preview screenshots -->
 <!-- <img src="static\RetroMorseTranslatorIRelease Graphic-export.png" alt="App graphics banner" width="600" /> -->
 Bigger icon 
</div>

Built with **Svelte** and wrapped with **Capacitor** to bring it to Android devices.


## Developing

Once you've created a project and installed dependencies with `npm install`, start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

chrome://inspect/#devices
```

To test the webapp on android do the following:

```sh
npm run build
npx cap copy
```

To connect your phone with android studio:

```sh
cd %LOCALAPPDATA%\Android\sdk\platform-tools
adb pair <PHONE_IP>:<PHONE_PORT>
adb connect <PHONE_IP>:<PORT_PROVIDED>
```

To see console.log/warn.etc visit and insert IP & port
chrome://inspect/#devices

## TODO
- [] Investigate and review SQL database structure
- [] Update Stock DB Entry when entering sell entry
- [] Validate changes to entry (maybe change history)
- [] Adjust charts to DB data
- adb pull /data/data/com.krowastudios.stockprofitier/trades_db.db