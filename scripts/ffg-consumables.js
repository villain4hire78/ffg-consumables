// FFG Consumables Module
// Adds a new Consumable item type and functionality for managing consumable items

class FFGConsumables {
  static ID = 'ffg-consumables';
  
  static FLAGS = {
    CONSUMABLE: 'consumable',
    EFFECT_TYPE: 'effectType',
    HEALING_AMOUNT: 'healingAmount'
  };

  static TEMPLATES = {
    CONSUMABLE_ITEM_SHEET: `modules/${this.ID}/templates/consumable-item-sheet.html`
  };

  static EFFECT_TYPES = {
    PAIN_KILLER: 'painKiller',
    STIM_PACK: 'stimPack',
    CUSTOM: 'custom'
  };

  static log(message) {
    console.log(`FFG Consumables | ${message}`);
  }

  static initialize() {
    this.log('Initializing FFG Consumables Module');
    
    // Register module settings
    this._registerSettings();
    
    // Register hooks
    this._registerHooks();
  }

  static _registerSettings() {
    game.settings.register(this.ID, 'enablePainkillerLimit', {
      name: 'Enable Painkiller Limit',
      hint: 'Enable the rule where each painkiller gives diminishing returns and becomes ineffective after 5 uses',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(this.ID, 'painkillerBaseHealing', {
      name: 'Painkiller Base Healing',
      hint: 'Amount of wounds healed by the first painkiller used',
      scope: 'world',
      config: true,
      type: Number,
      default: 5,
      range: {
        min: 1,
        max: 10,
        step: 1
      }
    });
    
    game.settings.register(this.ID, 'maxPainkillerUses', {
      name: 'Maximum Painkiller Uses',
      hint: 'Maximum number of painkillers that can be used per day before they become ineffective',
      scope: 'world',
      config: true,
      type: Number,
      default: 5,
      range: {
        min: 1,
        max: 10,
        step: 1
      }
    });
    
    game.settings.register(this.ID, 'stimPackStrainCost', {
      name: 'Stim Pack Strain Cost',
      hint: 'Amount of strain suffered when using a stim pack',
      scope: 'world',
      config: true,
      type: Number,
      default: 2,
      range: {
        min: 0,
        max: 5,
        step: 1
      }
    });
    
    game.settings.register(this.ID, 'stimPackBoostDuration', {
      name: 'Stim Pack Boost Duration (rounds)',
      hint: 'Number of rounds the boost die from a stim pack lasts',
      scope: 'world',
      config: true,
      type: Number,
      default: 1,
      range: {
        min: 1,
        max: 5,
        step: 1
      }
    });
    
    game.settings.register(this.ID, 'deleteConsumedItems', {
      name: 'Auto-delete empty consumables',
      hint: 'Automatically delete consumable items when their quantity reaches zero',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
  }

  static _registerHooks() {
    // Register the consumable item type
    Hooks.on('init', () => {
      this._defineConsumableItemType();
      this._registerTemplates();
    });

    // Register sheet application
    Hooks.on('setup', () => {
      this._registerItemSheetApplication();
    });

    // Add the Consume button to gear items that are consumables
    Hooks.on('renderItemSheet', (app, html, data) => {
      this._addConsumeButtonToSheet(app, html, data);
    });
  }

  static _defineConsumableItemType() {
    this.log('Registering Consumable item type');
    
    // Extend the base Item class to handle consumable items
    CONFIG.Item.documentClass = class ConsumableItem extends CONFIG.Item.documentClass {
      async consume() {
        if (this.type !== 'gear') return;
        
        // Check if this item is marked as a consumable
        const isConsumable = this.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.CONSUMABLE);
        if (!isConsumable) return;
        
        // Get the effect type and handle accordingly
        const effectType = this.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.EFFECT_TYPE) || FFGConsumables.EFFECT_TYPES.CUSTOM;
        
        // Check if the item has quantity remaining
        const quantity = this.system.quantity.value;
        if (quantity <= 0) {
          ui.notifications.error('No more of this consumable item remaining.');
          return;
        }
        
        // Handle different consumable types
        switch (effectType) {
          case FFGConsumables.EFFECT_TYPES.PAIN_KILLER:
            await this._handlePainKiller();
            break;
          case FFGConsumables.EFFECT_TYPES.STIM_PACK:
            await this._handleStimPack();
            break;
          case FFGConsumables.EFFECT_TYPES.CUSTOM:
          default:
            // For custom consumables, just decrease quantity
            break;
        }
        
        // Decrease quantity
        const newQuantity = Math.max(0, quantity - 1);
        await this.update({
          'system.quantity.value': newQuantity
        });
        
        // Check if we should delete the item when quantity reaches 0
        if (newQuantity === 0 && game.settings.get(FFGConsumables.ID, 'deleteConsumedItems')) {
          await this.delete();
          ui.notifications.info(`Used the last ${this.name}. Item removed from inventory.`);
        } else {
          // Notify the user
          ui.notifications.info(`Used one ${this.name}. ${newQuantity} remaining.`);
        }
      }
      
      async _handlePainKiller() {
        // Get the actor that owns this item
        const actor = this.parent;
        if (!actor) {
          ui.notifications.error('This consumable is not owned by an actor.');
          return;
        }
        
        // Check medical usage tracker
        const medicalUses = actor.system.stats.medical.uses;
        
        // Get settings
        const baseHealing = game.settings.get(FFGConsumables.ID, 'painkillerBaseHealing');
        const maxUses = game.settings.get(FFGConsumables.ID, 'maxPainkillerUses');
        
        // If painkiller limit is enabled, check the limit
        if (game.settings.get(FFGConsumables.ID, 'enablePainkillerLimit')) {
          if (medicalUses >= maxUses) {
            ui.notifications.error('Maximum painkiller usage exceeded for the day.');
            return false; // Don't consume the item
          }
        }
        
        // Calculate healing amount (decreases with each use if limit is enabled)
        let healingAmount = baseHealing;
        if (game.settings.get(FFGConsumables.ID, 'enablePainkillerLimit')) {
          healingAmount = Math.max(0, baseHealing - medicalUses);
        }
        
        // Update the actor's wounds and medical uses
        const currentWounds = actor.system.stats.wounds.value;
        const maxWounds = actor.system.stats.wounds.max;
        
        await actor.update({
          'system.stats.wounds.value': Math.max(0, currentWounds - healingAmount),
          'system.stats.medical.uses': medicalUses + 1
        });
        
        // Create chat message
        const content = `
          <div class="ffg-consumables painkiller-message">
            <h3>${actor.name} uses a Painkiller</h3>
            <p>Healed ${healingAmount} wounds.</p>
            <p>${medicalUses + 1} painkillers used today.</p>
          </div>
        `;
        
        ChatMessage.create({
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          content: content
        });
        
        ui.notifications.info(`Painkiller healed ${healingAmount} wounds.`);
        return true;
      }
      
      async _handleStimPack() {
        // Get the actor that owns this item
        const actor = this.parent;
        if (!actor) {
          ui.notifications.error('This consumable is not owned by an actor.');
          return;
        }
        
        // Get settings
        const strainCost = game.settings.get(FFGConsumables.ID, 'stimPackStrainCost');
        const boostDuration = game.settings.get(FFGConsumables.ID, 'stimPackBoostDuration');
        
        // Update the actor's strain
        const currentStrain = actor.system.stats.strain.value;
        const maxStrain = actor.system.stats.strain.max;
        
        // Add strain to the character
        const newStrain = Math.min(maxStrain, currentStrain + strainCost);
        
        await actor.update({
          'system.stats.strain.value': newStrain
        });
        
        // Create a temporary effect for the boost die
        const effectData = {
          label: 'Stim Pack Boost',
          icon: 'modules/ffg-consumables/images/stimpack-icon.png',
          origin: this.uuid,
          duration: {
            rounds: boostDuration,
            seconds: null,
            startTime: game.time.worldTime
          },
          flags: {
            'ffg-consumables': {
              type: 'stimPack',
              description: 'Add a boost die to skill checks'
            }
          }
        };
        
        await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
        
        // Display chat message about the stim pack effect
        const content = `
          <div class="ffg-consumables stim-pack-message">
            <h3>${actor.name} uses a Stim Pack</h3>
            <p>Adds a boost die (blue) to skill checks for ${boostDuration} round(s).</p>
            <p>Suffered ${strainCost} strain from the stimulant.</p>
          </div>
        `;
        
        ChatMessage.create({
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          content: content
        });
        
        ui.notifications.info(`Stim Pack applied: +1 boost die for ${boostDuration} round(s), +${strainCost} strain suffered.`);
        return true;
      }
    };
  }

  static _registerTemplates() {
    loadTemplates([
      FFGConsumables.TEMPLATES.CONSUMABLE_ITEM_SHEET
    ]);
  }

  static _registerItemSheetApplication() {
    // Register a custom sheet for consumable items
    Items.registerSheet('starwarsffg', ConsumableItemSheet, {
      types: ['gear'],
      makeDefault: false,
      label: 'Consumable Item'
    });
  }

  static _addConsumeButtonToSheet(app, html, data) {
    // Only proceed if this is a gear item
    if (app.object.type !== 'gear') return;
    
    // Check if this item is marked as consumable
    const isConsumable = app.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.CONSUMABLE);
    
    // Add a checkbox to mark/unmark the item as consumable
    const header = html.find('.sheet-header');
    const consumableCheckbox = $(`
      <div class="consumable-controls">
        <label>
          <input type="checkbox" data-action="toggle-consumable" ${isConsumable ? 'checked' : ''}>
          Consumable
        </label>
      </div>
    `);
    header.after(consumableCheckbox);
    
    // Add the consume button if this is a consumable
    if (isConsumable) {
      // Add consumable controls section with dropdown for effect type
      const consumableConfig = $(`
        <div class="form-group">
          <label>Consumable Type</label>
          <select name="flags.ffg-consumables.effectType">
            <option value="${FFGConsumables.EFFECT_TYPES.PAIN_KILLER}" ${app.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.EFFECT_TYPE) === FFGConsumables.EFFECT_TYPES.PAIN_KILLER ? 'selected' : ''}>Pain Killer</option>
            <option value="${FFGConsumables.EFFECT_TYPES.STIM_PACK}" ${app.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.EFFECT_TYPE) === FFGConsumables.EFFECT_TYPES.STIM_PACK ? 'selected' : ''}>Stim Pack</option>
            <option value="${FFGConsumables.EFFECT_TYPES.CUSTOM}" ${app.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.EFFECT_TYPE) === FFGConsumables.EFFECT_TYPES.CUSTOM ? 'selected' : ''}>Custom</option>
          </select>
        </div>
      `);
      html.find('.item-properties').after(consumableConfig);
      
      // Add consume button to the sheet header
      const consumeBtn = $(`<a class="consume-item"><i class="fas fa-prescription-bottle-alt"></i> Consume</a>`);
      html.find('.sheet-navigation').after(consumeBtn);
    }
    
    // Handle events
    html.find('[data-action="toggle-consumable"]').on('change', async (event) => {
      await app.object.setFlag(FFGConsumables.ID, FFGConsumables.FLAGS.CONSUMABLE, event.currentTarget.checked);
      app.render(true);
    });
    
    html.find('.consume-item').on('click', async (event) => {
      event.preventDefault();
      await app.object.consume();
      app.render(true);
    });
  }
}

// Custom Item Sheet for Consumables
export class ConsumableItemSheet extends game.starwarsffg.FFGItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['starwarsffg', 'sheet', 'item', 'consumable'],
      template: 'systems/starwarsffg/templates/items/ffg-gear-sheet.html',
      width: 560,
      height: 600,
      tabs: [{navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description'}]
    });
  }

  getData() {
    const data = super.getData();
    data.isConsumable = this.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.CONSUMABLE) || false;
    data.effectType = this.object.getFlag(FFGConsumables.ID, FFGConsumables.FLAGS.EFFECT_TYPE) || FFGConsumables.EFFECT_TYPES.CUSTOM;
    data.effectTypes = FFGConsumables.EFFECT_TYPES;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    // Add specific handlers for consumable items
    if (this.isEditable) {
      html.find('.consume-item').click(this._onConsume.bind(this));
    }
  }

  async _onConsume(event) {
    event.preventDefault();
    await this.object.consume();
    this.render(true);
  }
}

// Initialize the module
Hooks.once('init', () => {
  FFGConsumables.initialize();
});

// Add painkiller tracking and reset button to the character sheet
Hooks.on('renderActorSheet', (app, html, data) => {
  if (app.actor.type !== 'character') return;
  
  const medicalUses = app.actor.system.stats.medical.uses || 0;
  const maxUses = game.settings.get(FFGConsumables.ID, 'maxPainkillerUses');
  const painkillerEnabled = game.settings.get(FFGConsumables.ID, 'enablePainkillerLimit');
  
  // Calculate next painkiller effectiveness
  let nextHealingAmount = game.settings.get(FFGConsumables.ID, 'painkillerBaseHealing');
  if (painkillerEnabled) {
    nextHealingAmount = Math.max(0, nextHealingAmount - medicalUses);
  }
  
  // Create painkiller status display
  const painkillerStatus = $(`
    <div class="ffg-consumables painkiller-status">
      <div class="painkiller-header">
        <h3>Painkiller Status</h3>
        <button type="button" class="reset-medical-uses"><i class="fas fa-sync"></i> Reset</button>
      </div>
      <div class="painkiller-tracker">
        <div class="painkiller-uses">
          <span class="painkiller-label">Uses Today:</span>
          <span class="painkiller-value">${medicalUses} / ${maxUses}</span>
        </div>
        <div class="painkiller-effectiveness">
          <span class="painkiller-label">Next Effectiveness:</span>
          <span class="painkiller-value">${nextHealingAmount} wounds</span>
        </div>
      </div>
    </div>
  `);
  
  // Find a good spot to add the status display
  html.find('.characteristics').after(painkillerStatus);
  
  // Handle the reset button click
  painkillerStatus.find('.reset-medical-uses').click(async () => {
    await app.actor.update({
      'system.stats.medical.uses': 0
    });
    ui.notifications.info('Painkiller uses have been reset.');
    app.render(true);
  });
});

// Hook into the dice pool builder to add boost dice from stim packs
Hooks.on('starwarsffg.buildDicePool', (dicePool, actor) => {
  if (!actor) return;
  
  // Check if the actor has a stim pack effect
  const stimPackEffect = actor.effects.find(e => 
    e.getFlag('ffg-consumables', 'type') === 'stimPack'
  );
  
  // If stim pack effect exists, add a boost die
  if (stimPackEffect) {
    dicePool.boost += 1;
    
    // Optionally remove the effect after use
    // Uncomment this if you want the effect to be used up immediately
    // stimPackEffect.delete();
    
    // Send a chat message notification
    ChatMessage.create({
      content: `<div class="ffg-consumables"><p>${actor.name} gains +1 boost die from Stim Pack!</p></div>`,
      speaker: ChatMessage.getSpeaker({ actor })
    });
  }
  
  return dicePool;
});

// Add some CSS styling
Hooks.on('ready', () => {
  const style = document.createElement('style');
  style.textContent = `
    .consume-item {
      margin-left: 10px;
      background: #782e22;
      padding: 5px 10px;
      border-radius: 3px;
      color: white;
      cursor: pointer;
    }
    
    .consume-item:hover {
      background: #9e3c2c;
    }
    
    .consumable-controls {
      margin: 8px 0;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 3px;
    }
    
    .reset-medical-uses {
      margin: 10px 0;
      background: #2e4478;
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
    }
    
    .reset-medical-uses:hover {
      background: #3c569e;
    }
  `;
  document.head.appendChild(style);
});
