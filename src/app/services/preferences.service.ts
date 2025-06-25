// preferences.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  constructor() {}

  async setRememberedEmail(email: string): Promise<void> {
    await Preferences.set({
      key: 'rememberedEmail',
      value: email,
    });
  }

  async getRememberedEmail(): Promise<string | null> {
    const result = await Preferences.get({ key: 'rememberedEmail' });
    return result.value;
  }

  async clearRememberedEmail(): Promise<void> {
    await Preferences.remove({ key: 'rememberedEmail' });
  }
}
