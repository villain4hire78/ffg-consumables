# FFG Consumables

A Foundry VTT module for the Star Wars FFG system that adds functionality for consumable items.

## Features

- Mark any gear item as "consumable"
- Add a "Consume" button to use the item and decrease its quantity
- Special support for Pain Killers with diminishing returns rule
- Track painkiller usage per character
- Reset painkiller usage with a convenient button
- Support for custom consumable effects

## Pain Killer Rules

In the Genesys and Star Wars FFG systems, pain killers have the following effects:
- First painkiller: Heals 5 wounds
- Second painkiller: Heals 4 wounds
- Third painkiller: Heals 3 wounds
- Fourth painkiller: Heals 2 wounds
- Fifth painkiller: Heals 1 wound
- Sixth and subsequent painkillers: No effect

This module automatically tracks these uses and applies the correct healing amount.

## Installation

### Method 1: Foundry VTT Module Browser

1. In Foundry VTT, go to the "Add-on Modules" tab
2. Click "Install Module"
3. Search for "FFG Consumables"
4. Click "Install"

### Method 2: Manual Installation

1. Download the latest release from the [Releases page](https://github.com/yourusername/ffg-consumables/releases)
2. Extract the zip file
3. Move the extracted folder to your Foundry VTT modules directory
4. Restart Foundry VTT
5. Activate the module in your game world

## Usage

### Creating a Pain Killer Item

1. Create a new "Gear" type item
2. In the item sheet, check the "Consumable" checkbox
3. Select "Pain Killer" from the consumable type dropdown
4. Set the quantity to the number of pain killers available
5. Save the item

### Using Consumables

1. Open the item sheet
2. Click the "Consume" button
3. The item's quantity will decrease by 1
4. If it's a pain killer, wounds will be healed according to the rules

### Resetting Painkiller Uses

A "Reset Painkiller Uses" button is added to character sheets. Click this button to reset the character's painkiller usage count (typically done at the start of a new day in-game).

## Settings

The module adds the following settings:

- **Enable Painkiller Limit**: When enabled, painkillers follow the diminishing returns rule. When disabled, each painkiller will heal 5 wounds regardless of how many have been used.

## License

This module is licensed under the MIT License. See the LICENSE file for details.

## Credits

- Created by [Your Name]
- Star Wars FFG system by Jaxxa and the StarWarsFoundryVTT team
