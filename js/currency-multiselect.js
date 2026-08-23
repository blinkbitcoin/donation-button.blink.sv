/**
 * Blink Currency Multiselect
 *
 * An accessible, dependency-free multiselect for the generator's "Supported
 * currencies" field. Follows the WAI-ARIA 1.2 editable combobox + listbox
 * pattern: a search input inside a chip control, a dropdown listbox with
 * grouped options, full keyboard navigation (ArrowUp/Down, Enter, Space,
 * Home, End, Escape, Backspace), and screen-reader announcements via
 * aria-expanded / aria-activedescendant / aria-selected.
 *
 * It does not own the value: the canonical store remains the hidden
 * #currencyInput (comma-separated codes), which this component writes to and
 * fires a bubbling `input` event on, so generator.js's existing listeners,
 * validation and live preview keep working unchanged.
 *
 * Usage: window.BlinkCurrencyMultiselect.init({ mountId, inputId, groups })
 */
(function () {
    'use strict';

    var UID = 0;

    function createMultiselect(config) {
        var mount = document.getElementById(config.mountId);
        var input = document.getElementById(config.inputId);
        if (!mount || !input) {
            return null;
        }

        var id = 'blink-ms-' + ++UID;
        var groups = config.groups || [];
        var options = [];
        groups.forEach(function (group) {
            group.options.forEach(function (option) {
                options.push({ code: option.code, name: option.name, group: group.label });
            });
        });

        var selected = [];
        var isOpen = false;
        var activeIndex = -1; // index into the *visible* options
        var visibleOptions = options.slice();

        // ── DOM ──────────────────────────────────────────────────────────
        var container = document.createElement('div');
        container.className = 'ms-container';

        var control = document.createElement('div');
        control.className = 'ms-control';

        var chips = document.createElement('div');
        chips.className = 'ms-chips';

        var search = document.createElement('input');
        search.type = 'text';
        search.className = 'ms-search';
        search.id = id + '-input';
        search.setAttribute('role', 'combobox');
        search.setAttribute('aria-expanded', 'false');
        search.setAttribute('aria-controls', id + '-listbox');
        search.setAttribute('aria-autocomplete', 'list');
        search.setAttribute('aria-label', 'Search and select currencies');
        search.setAttribute('autocomplete', 'off');
        search.setAttribute('spellcheck', 'false');
        search.placeholder = 'Search currencies';

        var caret = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        caret.setAttribute('width', '16');
        caret.setAttribute('height', '16');
        caret.setAttribute('viewBox', '0 0 256 256');
        caret.setAttribute('aria-hidden', 'true');
        caret.classList.add('ms-caret');
        caret.innerHTML =
            '<path d="M40 96l88 88 88-88" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>';

        var listbox = document.createElement('ul');
        listbox.className = 'ms-listbox';
        listbox.id = id + '-listbox';
        listbox.setAttribute('role', 'listbox');
        listbox.setAttribute('aria-multiselectable', 'true');
        listbox.setAttribute('aria-label', 'Supported currencies');
        listbox.hidden = true;

        control.appendChild(chips);
        control.appendChild(search);
        control.appendChild(caret);
        container.appendChild(control);
        container.appendChild(listbox);
        mount.appendChild(container);

        // ── Value sync ─────────────────────────────────────────────────
        function parseInitialValue() {
            selected = (input.value || '')
                .split(',')
                .map(function (code) {
                    return code.trim().toUpperCase();
                })
                .filter(function (code) {
                    return code.length > 0;
                });
        }

        function writeValue() {
            input.value = selected.join(', ');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // ── Rendering ──────────────────────────────────────────────────
        function renderChips() {
            chips.innerHTML = '';
            selected.forEach(function (code) {
                var chip = document.createElement('span');
                chip.className = 'ms-chip';

                var label = document.createElement('span');
                label.textContent = code;

                var remove = document.createElement('button');
                remove.type = 'button';
                remove.textContent = '×';
                remove.setAttribute('aria-label', 'Remove ' + code);
                // Out of the tab order (selection is manageable via the
                // combobox/listbox); click-only convenience.
                remove.tabIndex = -1;
                remove.addEventListener('click', function (event) {
                    event.stopPropagation();
                    deselect(code);
                    search.focus();
                });

                chip.appendChild(label);
                chip.appendChild(remove);
                chips.appendChild(chip);
            });
        }

        function matchesQuery(option) {
            var query = search.value.trim().toUpperCase();
            if (!query) {
                return true;
            }
            return (
                option.code.toUpperCase().indexOf(query) !== -1 ||
                (option.name && option.name.toUpperCase().indexOf(query) !== -1)
            );
        }

        function renderListbox() {
            visibleOptions = options.filter(matchesQuery);
            listbox.innerHTML = '';

            var lastGroup = null;
            visibleOptions.forEach(function (option, index) {
                if (option.group !== lastGroup) {
                    lastGroup = option.group;
                    var groupLabel = document.createElement('li');
                    groupLabel.className = 'ms-group-label';
                    groupLabel.textContent = option.group;
                    groupLabel.setAttribute('role', 'presentation');
                    listbox.appendChild(groupLabel);
                }

                var li = document.createElement('li');
                li.className = 'ms-option';
                li.id = id + '-option-' + index;
                li.setAttribute('role', 'option');
                li.setAttribute(
                    'aria-selected',
                    selected.indexOf(option.code) !== -1 ? 'true' : 'false'
                );

                var check = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                check.setAttribute('width', '16');
                check.setAttribute('height', '16');
                check.setAttribute('viewBox', '0 0 256 256');
                check.setAttribute('aria-hidden', 'true');
                check.classList.add('ms-option-check');
                check.innerHTML =
                    '<path d="M40 128l64 64L216 72" fill="none" stroke="currentColor" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>';

                var code = document.createElement('span');
                code.textContent = option.code;

                var name = document.createElement('span');
                name.className = 'ms-option-name';
                name.textContent = option.name || '';

                li.appendChild(check);
                li.appendChild(code);
                li.appendChild(name);

                li.addEventListener('mousedown', function (event) {
                    // Keep focus on the search input (prevents blur-close).
                    event.preventDefault();
                });
                li.addEventListener('click', function () {
                    toggle(option.code);
                    search.focus();
                });
                li.addEventListener('mousemove', function () {
                    setActive(index, false);
                });

                listbox.appendChild(li);
            });

            if (visibleOptions.length === 0) {
                var empty = document.createElement('li');
                empty.className = 'ms-group-label';
                empty.textContent = 'No currencies match';
                empty.setAttribute('role', 'presentation');
                listbox.appendChild(empty);
            }

            if (activeIndex >= visibleOptions.length) {
                activeIndex = visibleOptions.length - 1;
            }
            paintActive();
        }

        function paintActive() {
            var items = listbox.querySelectorAll('.ms-option');
            items.forEach(function (item, index) {
                item.classList.toggle('ms-active', index === activeIndex);
            });
            var active =
                activeIndex >= 0 ? listbox.querySelectorAll('.ms-option')[activeIndex] : null;
            if (active) {
                search.setAttribute('aria-activedescendant', active.id);
                active.scrollIntoView({ block: 'nearest' });
            } else {
                search.removeAttribute('aria-activedescendant');
            }
        }

        function setActive(index, paint) {
            activeIndex = index;
            if (paint !== false) {
                paintActive();
            }
        }

        // ── Open/close ─────────────────────────────────────────────────
        function open() {
            if (isOpen) {
                return;
            }
            isOpen = true;
            listbox.hidden = false;
            search.setAttribute('aria-expanded', 'true');
            activeIndex = -1;
            renderListbox();
        }

        function close() {
            if (!isOpen) {
                return;
            }
            isOpen = false;
            listbox.hidden = true;
            search.setAttribute('aria-expanded', 'false');
            search.removeAttribute('aria-activedescendant');
        }

        // ── Selection ──────────────────────────────────────────────────
        function select(code) {
            if (selected.indexOf(code) === -1) {
                selected.push(code);
                renderChips();
                writeValue();
            }
            if (isOpen) {
                renderListbox();
            }
        }

        function deselect(code) {
            var index = selected.indexOf(code);
            if (index !== -1) {
                selected.splice(index, 1);
                renderChips();
                writeValue();
            }
            if (isOpen) {
                renderListbox();
            }
        }

        function toggle(code) {
            if (selected.indexOf(code) === -1) {
                select(code);
            } else {
                deselect(code);
            }
        }

        // ── Events ─────────────────────────────────────────────────────
        control.addEventListener('click', function () {
            search.focus();
            open();
        });

        search.addEventListener('focus', open);

        search.addEventListener('input', function () {
            activeIndex = visibleOptions.length > 0 ? 0 : -1;
            open();
            renderListbox();
        });

        search.addEventListener('keydown', function (event) {
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    open();
                    setActive(Math.min(activeIndex + 1, visibleOptions.length - 1));
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    setActive(Math.max(activeIndex - 1, 0));
                    break;
                case 'Home':
                    event.preventDefault();
                    setActive(0);
                    break;
                case 'End':
                    event.preventDefault();
                    setActive(visibleOptions.length - 1);
                    break;
                case 'Enter':
                    if (isOpen && activeIndex >= 0 && visibleOptions[activeIndex]) {
                        event.preventDefault();
                        toggle(visibleOptions[activeIndex].code);
                        search.value = '';
                        renderListbox();
                    }
                    break;
                case ' ':
                    if (
                        isOpen &&
                        activeIndex >= 0 &&
                        visibleOptions[activeIndex] &&
                        search.value === ''
                    ) {
                        event.preventDefault();
                        toggle(visibleOptions[activeIndex].code);
                    }
                    break;
                case 'Backspace':
                    if (search.value === '' && selected.length > 0) {
                        deselect(selected[selected.length - 1]);
                    }
                    break;
                case 'Escape':
                    close();
                    break;
                case 'Tab':
                    close();
                    break;
            }
        });

        document.addEventListener('click', function (event) {
            if (!container.contains(event.target)) {
                close();
            }
        });

        // ── Init ───────────────────────────────────────────────────────
        parseInitialValue();
        renderChips();

        return {
            getSelected: function () {
                return selected.slice();
            },
            select: select,
            deselect: deselect,
        };
    }

    window.BlinkCurrencyMultiselect = {
        init: createMultiselect,
    };
})();
