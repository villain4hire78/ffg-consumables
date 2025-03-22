# FFG Consumables Module Installation Guide

## Prerequisites

- Foundry VTT (version 10.0 or higher)
- Star Wars FFG or Genesys system installed and active

## Installation

### Method 1: Using the Foundry VTT Module Browser (Recommended)

1. In your Foundry VTT setup, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "FFG Consumables"
4. Click "Install"

### Method 2: Manual Installation

1. Download the module ZIP from the [Releases](https://github.com/yourusername/ffg-consumables/releases) page
2. Extract the ZIP file
3. Move the extracted folder to your Foundry VTT modules directory
   - Windows: `%appdata%\FoundryVTT\Data\modules\`
   - macOS: `~/Library/Application Support/FoundryVTT/Data/modules/`
   - Linux: `~/.local/share/FoundryVTT/Data/modules/`
4. Rename the folder to `ffg-consumables` if it's not already named that

## Activating the Module

1. Start or restart Foundry VTT
2. Create a new world or load an existing one
3. Go to "Game Settings"
4. Click on "Manage Modules"
5. Find "FFG Consumables" in the list and check the box to enable it
6. Click "Save Module Settings"

## Verifying Installation

To verify that the module is working correctly:

1. Create a new item of type "Gear"
2. Open the item sheet
3. You should see a "Consumable" checkbox in the header area
4. Check the box to mark the item as a consumable
5. You should now see additional consumable options and a "Consume" button

## Importing Sample Items

The module includes sample consumable items that you can import:

1. In the Items directory, click "Import"
2. Navigate to the module's `samples` directory
3. Import `painkiller.json` or `stimpack.json`
4. The imported items will be available in your Items directory

## Module Configuration

To configure module settings:

1. Go to "Game Settings"
2. Click on "Configure Settings"
3. Find the "FFG Consumables" section
4. Adjust settings as needed:
   - Enable/disable painkiller limit
   - Adjust painkiller base healing
   - Set maximum painkiller uses
   - Configure stim pack effects
   - Toggle auto-deletion of empty consumables

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages (F12 in most browsers)
2. Verify that the Star Wars FFG system is up to date
3. Make sure all module files are in the correct directories
4. Try disabling other modules to check for conflicts
5. Report issues on the [GitHub repository](https://github.com/yourusername/ffg-consumables/issues)
