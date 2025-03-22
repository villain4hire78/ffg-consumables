# FFG Consumables Module Directory Structure

Here's how to organize your module files:

```
ffg-consumables/
├── module.json
├── README.md
├── LICENSE
├── DIRECTORY_STRUCTURE.md
├── scripts/
│   └── ffg-consumables.js
├── styles/
│   └── ffg-consumables.css
├── languages/
│   └── en.json
├── templates/
│   └── consumable-item-sheet.html
├── samples/
│   ├── painkiller.json
│   └── stimpack.json
└── images/
    ├── painkiller.png
    ├── stimpack.png
    └── stimpack-icon.png
```

## Files to Create or Download

You'll need to create or download the following files:

### Images

The module expects the following image files in the `images` directory:
- `painkiller.png` - Icon for Pain Killer items
- `stimpack.png` - Icon for Stim Pack items
- `stimpack-icon.png` - Small icon used for the Stim Pack effect

You can create these images yourself or use existing icons that match the Star Wars FFG style.

### License

It's recommended to include a LICENSE file. If you're making your module public, consider using MIT, Apache, or GPL licenses.

## Installation

When installing the module, make sure to maintain this directory structure. The module can be installed in your Foundry VTT modules directory:

```
[foundry data]/Data/modules/ffg-consumables/
```

Where `[foundry data]` is your Foundry VTT data path.
