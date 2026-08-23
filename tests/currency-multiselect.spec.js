/**
 * Characterization tests for js/currency-multiselect.js — the accessible
 * multiselect mounted over the hidden #currencyInput.
 *
 * Contract asserted here (used by generator.js):
 *  - mounts into #currencyMultiselect and seeds chips from the input's
 *    initial comma-separated value;
 *  - selecting/deselecting an option writes comma-separated codes back into
 *    #currencyInput and fires a bubbling `input` event (which generator.js
 *    listens to for validation, codegen and live preview);
 *  - WAI-ARIA combobox + listbox wiring: role/aria-expanded/aria-selected/
 *    aria-activedescendant and keyboard navigation (ArrowDown/Up, Enter,
 *    Escape, Backspace).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const multiselectSrc = readFileSync(resolve(here, '../js/currency-multiselect.js'), 'utf8');

const GROUPS = [
    {
        label: 'Major',
        options: [
            { code: 'USD', name: 'US Dollar' },
            { code: 'EUR', name: 'Euro' },
            { code: 'GBP', name: 'British Pound' },
        ],
    },
    {
        label: 'African',
        options: [
            { code: 'NGN', name: 'Nigerian Naira' },
            { code: 'KES', name: 'Kenyan Shilling' },
        ],
    },
];

function mount(initialValue = 'USD') {
    document.body.innerHTML = `
        <div id="currencyMultiselect"></div>
        <input type="text" id="currencyInput" value="${initialValue}" />
    `;
    new Function(multiselectSrc)();
    const instance = window.BlinkCurrencyMultiselect.init({
        mountId: 'currencyMultiselect',
        inputId: 'currencyInput',
        groups: GROUPS,
    });
    return {
        instance,
        input: document.getElementById('currencyInput'),
        combobox: document.querySelector('[role="combobox"]'),
        listbox: () => document.querySelector('[role="listbox"]'),
        options: () => [...document.querySelectorAll('[role="option"]')],
        chips: () => [...document.querySelectorAll('.ms-chip')],
    };
}

function keydown(el, key) {
    el.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('currency multiselect', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        // jsdom does not implement scrollIntoView; the component calls it to
        // keep the active option visible during keyboard navigation.
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    it('returns null gracefully when mount points are missing', () => {
        document.body.innerHTML = '<div></div>';
        new Function(multiselectSrc)();
        expect(
            window.BlinkCurrencyMultiselect.init({
                mountId: 'nope',
                inputId: 'nope',
                groups: GROUPS,
            })
        ).toBeNull();
    });

    it('seeds chips from the input initial value', () => {
        const { chips, combobox } = mount('USD, EUR');
        expect(chips().map((c) => c.textContent.replace('×', ''))).toEqual(['USD', 'EUR']);
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('writes comma-separated codes to the input and fires a bubbling input event', () => {
        const { input, combobox, options } = mount('USD');
        const events = [];
        input.addEventListener('input', () => events.push(input.value));

        combobox.dispatchEvent(new window.FocusEvent('focus'));
        const eur = options().find((o) => o.textContent.includes('EUR'));
        eur.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

        expect(input.value).toBe('USD, EUR');
        expect(events).toEqual(['USD, EUR']);
    });

    it('removes a selection via the chip remove button', () => {
        const { input, chips } = mount('USD, EUR');
        chips()[0]
            .querySelector('button')
            .dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
        expect(input.value).toBe('EUR');
    });

    it('removes the last chip on Backspace in an empty search', () => {
        const { input, combobox } = mount('USD, EUR');
        keydown(combobox, 'Backspace');
        expect(input.value).toBe('USD');
    });

    it('opens on focus, marks aria-expanded, and closes on Escape', () => {
        const { combobox, listbox } = mount();
        combobox.dispatchEvent(new window.FocusEvent('focus'));
        expect(listbox().hidden).toBe(false);
        expect(combobox.getAttribute('aria-expanded')).toBe('true');

        keydown(combobox, 'Escape');
        expect(listbox().hidden).toBe(true);
        expect(combobox.getAttribute('aria-expanded')).toBe('false');
    });

    it('navigates with arrows and toggles with Enter', () => {
        const { input, combobox, options } = mount('');
        combobox.dispatchEvent(new window.FocusEvent('focus'));

        keydown(combobox, 'ArrowDown');
        keydown(combobox, 'ArrowDown');
        // Second visible option is EUR.
        expect(combobox.getAttribute('aria-activedescendant')).toBe(options()[1].id);

        keydown(combobox, 'Enter');
        expect(input.value).toBe('EUR');
        expect(options()[1].getAttribute('aria-selected')).toBe('true');
    });

    it('filters options by search text', () => {
        const { combobox, options } = mount('');
        combobox.dispatchEvent(new window.FocusEvent('focus'));
        combobox.value = 'naira';
        combobox.dispatchEvent(new window.Event('input', { bubbles: true }));
        expect(options()).toHaveLength(1);
        expect(options()[0].textContent).toContain('NGN');
    });

    it('deselects an already-selected option on Enter', () => {
        const { input, combobox } = mount('USD');
        combobox.dispatchEvent(new window.FocusEvent('focus'));
        keydown(combobox, 'ArrowDown');
        keydown(combobox, 'Enter');
        expect(input.value).toBe('');
    });
});
