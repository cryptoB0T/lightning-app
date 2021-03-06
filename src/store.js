import { extendObservable, action } from 'mobx';
import ComputedWallet from './computed/wallet';
import ComputedTransaction from './computed/transaction';
import ComputedChannel from './computed/channel';
import ComputedInvoice from './computed/invoice';
import ComputedPayment from './computed/payment';
import { DEFAULT_ROUTE, DEFAULT_UNIT, DEFAULT_FIAT } from './config';
import * as log from './action/log';

export class Store {
  constructor() {
    extendObservable(this, {
      loaded: false, // Is persistent data loaded
      unlockerReady: false, // Is wallet unlocker running
      walletUnlocked: false, // Is the wallet unlocked
      lndReady: false, // Is lnd process running
      syncedToChain: false, // Is lnd synced to blockchain
      route: DEFAULT_ROUTE,
      blockHeight: null,
      balanceSatoshis: null,
      confirmedBalanceSatoshis: null,
      unconfirmedBalanceSatoshis: null,
      channelBalanceSatoshis: null,
      pubKey: null,
      walletAddress: null,
      displayCopied: false,
      ipAddress: null,
      transactions: null,
      invoices: null,
      invoice: {
        amount: '',
        note: '',
        encoded: null,
        uri: null,
      },
      payments: null,
      payment: {
        address: '',
        amount: '',
        fee: '',
        note: '',
      },
      peers: null,
      channels: null,
      pendingChannels: null,
      paymentRequest: null,
      seedMnemonic: null,
      notifications: [],
      logs: [],

      // Persistent data
      settings: {
        unit: DEFAULT_UNIT,
        fiat: DEFAULT_FIAT,
        displayFiat: false,
        exchangeRate: {
          usd: null,
          eur: null,
        },
      },
    });

    ComputedWallet(this);
    ComputedTransaction(this);
    ComputedChannel(this);
    ComputedInvoice(this);
    ComputedPayment(this);
  }

  init(AsyncStorage) {
    this._AsyncStorage = AsyncStorage;
    try {
      this._AsyncStorage.getItem('settings').then(
        action(stateString => {
          const state = JSON.parse(stateString);
          state &&
            Object.keys(state).forEach(key => {
              if (typeof this.settings[key] !== 'undefined') {
                this.settings[key] = state[key];
              }
            });
          log.info('Loaded initial state');
          this.loaded = true;
        })
      );
    } catch (err) {
      log.info('Store load error', err);
      this.loaded = true;
    }
  }

  save() {
    try {
      const state = JSON.stringify(this.settings);
      this._AsyncStorage.setItem('settings', state);
      log.info('Saved state');
    } catch (error) {
      log.info('Store Error', error);
    }
  }

  clear() {
    log.info('!!!!!!!!!CLEARING ALL PERSISTENT DATA!!!!!!');
    Object.keys(this.settings).map(key => (this.settings[key] = null));
    this.save();
  }
}

export default new Store();
