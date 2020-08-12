!function () {
    "use strict";
    var e = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        BACKSPACE: 8,
        DELETE: 46,
        COMMAND: 91,
        MAP: {
            91: "COMMAND",
            8: "BACKSPACE",
            9: "TAB",
            13: "ENTER",
            16: "SHIFT",
            17: "CTRL",
            18: "ALT",
            19: "PAUSEBREAK",
            20: "CAPSLOCK",
            27: "ESC",
            32: "SPACE",
            33: "PAGE_UP",
            34: "PAGE_DOWN",
            35: "END",
            36: "HOME",
            37: "LEFT",
            38: "UP",
            39: "RIGHT",
            40: "DOWN",
            43: "+",
            44: "PRINTSCREEN",
            45: "INSERT",
            46: "DELETE",
            48: "0",
            49: "1",
            50: "2",
            51: "3",
            52: "4",
            53: "5",
            54: "6",
            55: "7",
            56: "8",
            57: "9",
            59: ";",
            61: "=",
            65: "A",
            66: "B",
            67: "C",
            68: "D",
            69: "E",
            70: "F",
            71: "G",
            72: "H",
            73: "I",
            74: "J",
            75: "K",
            76: "L",
            77: "M",
            78: "N",
            79: "O",
            80: "P",
            81: "Q",
            82: "R",
            83: "S",
            84: "T",
            85: "U",
            86: "V",
            87: "W",
            88: "X",
            89: "Y",
            90: "Z",
            96: "0",
            97: "1",
            98: "2",
            99: "3",
            100: "4",
            101: "5",
            102: "6",
            103: "7",
            104: "8",
            105: "9",
            106: "*",
            107: "+",
            109: "-",
            110: ".",
            111: "/",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12",
            144: "NUMLOCK",
            145: "SCROLLLOCK",
            186: ";",
            187: "=",
            188: ",",
            189: "-",
            190: ".",
            191: "/",
            192: "`",
            219: "[",
            220: "\\",
            221: "]",
            222: "'"
        },
        isControl: function (t) {
            var c = t.which;
            switch (c) {
                case e.COMMAND:
                case e.SHIFT:
                case e.CTRL:
                case e.ALT:
                    return !0
            }
            return t.metaKey ? !0 : !1
        },
        isFunctionKey: function (e) {
            return e = e.which ? e.which : e, e >= 112 && 123 >= e
        },
        isVerticalMovement: function (t) {
            return ~[e.UP, e.DOWN].indexOf(t)
        },
        isHorizontalMovement: function (t) {
            return ~[e.LEFT, e.RIGHT, e.BACKSPACE, e.DELETE].indexOf(t)
        }
    };
    void 0 === angular.element.prototype.querySelectorAll && (angular.element.prototype.querySelectorAll = function (e) {
        return angular.element(this[0].querySelectorAll(e))
    }), void 0 === angular.element.prototype.closest && (angular.element.prototype.closest = function (e) {
        for (var t = this[0], c = t.matches || t.webkitMatchesSelector || t.mozMatchesSelector || t.msMatchesSelector; t;) {
            if (c.bind(t)(e))return t;
            t = t.parentElement
        }
        return !1
    }), angular.module("ui.select", []).constant("uiSelectConfig", {
        theme: "bootstrap",
        searchEnabled: !0,
        placeholder: "",
        refreshDelay: 1e3,
        closeOnSelect: !0
    }).service("uiSelectMinErr", function () {
        var e = angular.$$minErr("ui.select");
        return function () {
            var t = e.apply(this, arguments), c = t.message.replace(new RegExp("\nhttps://errors.angularjs.org/.*"), "");
            return new Error(c)
        }
    }).service("RepeatParser", ["uiSelectMinErr", "$parse", function (e, t) {
        var c = this;
        c.parse = function (c) {
            var l = c.match(/^\s*(?:([\s\S]+?)\s+as\s+)?([\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
            if (!l)throw e("iexp", "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", c);
            return {itemName: l[2], source: t(l[3]), trackByExp: l[4], modelMapper: t(l[1] || l[2])}
        }, c.getGroupNgRepeatExpression = function () {
            return "$group in $select.groups"
        }, c.getNgRepeatExpression = function (e, t, c, l) {
            var i = e + " in " + (l ? "$group.items" : t);
            return c && (i += " track by " + c), i
        }
    }]).controller("uiSelectCtrl", ["$scope", "$element", "$timeout", "$filter", "RepeatParser", "uiSelectMinErr", "uiSelectConfig", function (t, c, l, i, s, n, a) {
        function r() {
            (f.resetSearchInput || void 0 === f.resetSearchInput && a.resetSearchInput) && (f.search = v, f.selected && f.items.length && !f.multiple && (f.activeIndex = f.items.indexOf(f.selected)))
        }

        function o(t) {
            var c = !0;
            switch (t) {
                case e.DOWN:
                    !f.open && f.multiple ? f.activate(!1, !0) : f.activeIndex < f.items.length - 1 && f.activeIndex++;
                    break;
                case e.UP:
                    !f.open && f.multiple ? f.activate(!1, !0) : (f.activeIndex > 0 || 0 === f.search.length && f.tagging.isActivated) && f.activeIndex--;
                    break;
                case e.TAB:
                    (!f.multiple || f.open) && f.select(f.items[f.activeIndex], !0);
                    break;
                case e.ENTER:
                    f.open ? f.select(f.items[f.activeIndex]) : f.activate(!1, !0);
                    break;
                case e.ESC:
                    f.close();
                    break;
                default:
                    c = !1
            }
            return c
        }

        function u(t) {
            function c() {
                switch (t) {
                    case e.LEFT:
                        return ~f.activeMatchIndex ? o : n;
                    case e.RIGHT:
                        return ~f.activeMatchIndex && a !== n ? r : (f.activate(), !1);
                    case e.BACKSPACE:
                        return ~f.activeMatchIndex ? (f.removeChoice(a), o) : n;
                    case e.DELETE:
                        return ~f.activeMatchIndex ? (f.removeChoice(f.activeMatchIndex), a) : !1
                }
            }

            var l = h(m[0]), i = f.selected.length, s = 0, n = i - 1, a = f.activeMatchIndex, r = f.activeMatchIndex + 1, o = f.activeMatchIndex - 1, u = a;
            return l > 0 || f.search.length && t == e.RIGHT ? !1 : (f.close(), u = c(), f.activeMatchIndex = f.selected.length && u !== !1 ? Math.min(n, Math.max(s, u)) : -1, !0)
        }

        function d(e) {
            if (void 0 === e || void 0 === f.search)return !1;
            var t = e.filter(function (e) {
                    return void 0 === f.search.toUpperCase() ? !1 : e.toUpperCase() === f.search.toUpperCase()
                }).length > 0;
            return t
        }

        function p(e, t) {
            for (var c = angular.copy(e), l = -1, i = 0; i < c.length; i++)if (void 0 === f.tagging.fct)c[i] + " " + f.taggingLabel === t && (l = i); else {
                var s = c[i];
                s.isTag = !0, angular.equals(s, t) && (l = i)
            }
            return l
        }

        function h(e) {
            return angular.isNumber(e.selectionStart) ? e.selectionStart : e.value.length
        }

        function g() {
            var e = c.querySelectorAll(".ui-select-choices-content"), t = e.querySelectorAll(".ui-select-choices-row");
            if (t.length < 1)throw n("choices", "Expected multiple .ui-select-choices-row but got '{0}'.", t.length);
            var l = t[f.activeIndex], i = l.offsetTop + l.clientHeight - e[0].scrollTop, s = e[0].offsetHeight;
            i > s ? e[0].scrollTop += i - s : i < l.clientHeight && (f.isGrouped && 0 === f.activeIndex ? e[0].scrollTop = 0 : e[0].scrollTop -= l.clientHeight - i)
        }

        var f = this, v = "";
        f.placeholder = void 0, f.search = v, f.activeIndex = 0, f.activeMatchIndex = -1, f.items = [], f.selected = void 0, f.open = !1, f.focus = !1, f.focusser = void 0, f.disabled = void 0, f.searchEnabled = void 0, f.resetSearchInput = void 0, f.refreshDelay = void 0, f.multiple = !1, f.disableChoiceExpression = void 0, f.tagging = {
            isActivated: !1,
            fct: void 0
        }, f.taggingTokens = {
            isActivated: !1,
            tokens: void 0
        }, f.lockChoiceExpression = void 0, f.closeOnSelect = !0, f.clickTriggeredSelect = !1, f.$filter = i, f.isEmpty = function () {
            return angular.isUndefined(f.selected) || null === f.selected || "" === f.selected
        };
        var m = c.querySelectorAll("input.ui-select-search");
        if (1 !== m.length)throw n("searchInput", "Expected 1 input.ui-select-search but got '{0}'.", m.length);
        f.activate = function (e, t) {
            f.disabled || f.open || (t || r(), f.focusser.prop("disabled", !0), f.open = !0, f.activeMatchIndex = -1, f.activeIndex = f.activeIndex >= f.items.length ? 0 : f.activeIndex, -1 === f.activeIndex && f.taggingLabel !== !1 && (f.activeIndex = 0), l(function () {
                f.search = e || f.search, m[0].focus()
            }))
        }, f.findGroupByName = function (e) {
            return f.groups && f.groups.filter(function (t) {
                    return t.name === e
                })[0]
        }, f.parseRepeatAttr = function (e, c) {
            function l(e) {
                f.groups = [], angular.forEach(e, function (e) {
                    var l = t.$eval(c), i = angular.isFunction(l) ? l(e) : e[l], s = f.findGroupByName(i);
                    s ? s.items.push(e) : f.groups.push({name: i, items: [e]})
                }), f.items = [], f.groups.forEach(function (e) {
                    f.items = f.items.concat(e.items)
                })
            }

            function i(e) {
                f.items = e
            }

            var a = c ? l : i;
            f.parserResult = s.parse(e), f.isGrouped = !!c, f.itemProperty = f.parserResult.itemName, t.$watchCollection(f.parserResult.source, function (e) {
                if (void 0 === e || null === e)f.items = []; else {
                    if (!angular.isArray(e))throw n("items", "Expected an array but got '{0}'.", e);
                    if (f.multiple) {
                        var t = e.filter(function (e) {
                            return f.selected.indexOf(e) < 0
                        });
                        a(t)
                    } else a(e);
                    f.ngModel.$modelValue = null
                }
            }), f.multiple && t.$watchCollection("$select.selected", function (e) {
                var c = f.parserResult.source(t);
                if (e.length) {
                    if (void 0 !== c) {
                        var l = c.filter(function (t) {
                            return e.indexOf(t) < 0
                        });
                        a(l)
                    }
                } else a(c);
                f.sizeSearchInput()
            })
        };
        var $;
        f.refresh = function (e) {
            void 0 !== e && ($ && l.cancel($), $ = l(function () {
                t.$eval(e)
            }, f.refreshDelay))
        }, f.setActiveItem = function (e) {
            f.activeIndex = f.items.indexOf(e)
        }, f.isActive = function (e) {
            if (!f.open)return !1;
            var t = f.items.indexOf(e[f.itemProperty]), c = t === f.activeIndex;
            return !c || 0 > t && f.taggingLabel !== !1 || 0 > t && f.taggingLabel === !1 ? !1 : (c && !angular.isUndefined(f.onHighlightCallback) && e.$eval(f.onHighlightCallback), c)
        }, f.isDisabled = function (e) {
            if (f.open) {
                var t, c = f.items.indexOf(e[f.itemProperty]), l = !1;
                return c >= 0 && !angular.isUndefined(f.disableChoiceExpression) && (t = f.items[c], l = !!e.$eval(f.disableChoiceExpression), t._uiSelectChoiceDisabled = l), l
            }
        }, f.select = function (e, c, i) {
            if (void 0 === e || !e._uiSelectChoiceDisabled) {
                if (!f.items && !f.search)return;
                if (!e || !e._uiSelectChoiceDisabled) {
                    if (f.tagging.isActivated) {
                        if (f.taggingLabel === !1)if (f.activeIndex < 0) {
                            if (e = void 0 !== f.tagging.fct ? f.tagging.fct(f.search) : f.search, angular.equals(f.items[0], e))return
                        } else e = f.items[f.activeIndex]; else if (0 === f.activeIndex) {
                            if (void 0 === e)return;
                            void 0 !== f.tagging.fct && "string" == typeof e ? e = f.tagging.fct(f.search) : "string" == typeof e && (e = e.replace(f.taggingLabel, "").trim())
                        }
                        if (f.selected && f.selected.filter(function (t) {
                                return angular.equals(t, e)
                            }).length > 0)return void f.close(c)
                    }
                    var s = {};
                    s[f.parserResult.itemName] = e, f.multiple ? (f.selected.push(e), f.sizeSearchInput()) : f.selected = e, l(function () {
                        f.onSelectCallback(t, {$item: e, $model: f.parserResult.modelMapper(t, s)})
                    }), (!f.multiple || f.closeOnSelect) && f.close(c), i && "click" === i.type && (f.clickTriggeredSelect = !0)
                }
            }
        }, f.close = function (e) {
            f.open && (r(), f.open = !1, f.multiple || l(function () {
                f.focusser.prop("disabled", !1), e || f.focusser[0].focus()
            }, 0, !1))
        }, f.toggle = function (e) {
            f.open ? (f.close(), e.preventDefault(), e.stopPropagation()) : f.activate()
        }, f.isLocked = function (e, t) {
            var c, l = f.selected[t];
            return l && !angular.isUndefined(f.lockChoiceExpression) && (c = !!e.$eval(f.lockChoiceExpression), l._uiSelectChoiceLocked = c), c
        }, f.removeChoice = function (e) {
            var c = f.selected[e];
            if (!c._uiSelectChoiceLocked) {
                var i = {};
                i[f.parserResult.itemName] = c, f.selected.splice(e, 1), f.activeMatchIndex = -1, f.sizeSearchInput(), l(function () {
                    f.onRemoveCallback(t, {$item: c, $model: f.parserResult.modelMapper(t, i)})
                })
            }
        }, f.getPlaceholder = function () {
            return f.multiple && f.selected.length ? void 0 : f.placeholder
        };
        var b;
        f.sizeSearchInput = function () {
            var e = m[0], c = m.parent().parent()[0];
            m.css("width", "500px");
            var i = function () {
                var t = c.clientWidth - e.offsetLeft - 10;
                50 > t && (t = c.clientWidth), m.css("width", t + "px")
            };
            l(function () {
                0 !== c.clientWidth || b ? b || i() : b = t.$watch(function () {
                    return c.clientWidth
                }, function (e) {
                    0 !== e && (i(), b(), b = null)
                })
            }, 0, !1)
        }, m.on("keydown", function (c) {
            var i = c.which;
            t.$apply(function () {
                var t = !1, s = !1;
                if (f.multiple && e.isHorizontalMovement(i) && (t = u(i)), !t && (f.items.length > 0 || f.tagging.isActivated) && (t = o(i), f.taggingTokens.isActivated)) {
                    for (var n = 0; n < f.taggingTokens.tokens.length; n++)f.taggingTokens.tokens[n] === e.MAP[c.keyCode] && f.search.length > 0 && (s = !0);
                    s && l(function () {
                        m.triggerHandler("tagged");
                        var t = f.search.replace(e.MAP[c.keyCode], "").trim();
                        f.tagging.fct && (t = f.tagging.fct(t)), f.select(t, !0)
                    })
                }
                t && i != e.TAB && (c.preventDefault(), c.stopPropagation())
            }), e.isVerticalMovement(i) && f.items.length > 0 && g()
        }), m.on("keyup", function (c) {
            if (e.isVerticalMovement(c.which) || t.$evalAsync(function () {
                    f.activeIndex = f.taggingLabel === !1 ? -1 : 0
                }), f.tagging.isActivated && f.search.length > 0) {
                if (c.which === e.TAB || e.isControl(c) || e.isFunctionKey(c) || c.which === e.ESC || e.isVerticalMovement(c.which))return;
                if (f.activeIndex = f.taggingLabel === !1 ? -1 : 0, f.taggingLabel === !1)return;
                var l, i, s, n, a = angular.copy(f.items), r = angular.copy(f.items), o = !1, u = -1;
                if (void 0 !== f.tagging.fct) {
                    if (s = f.$filter("filter")(a, {isTag: !0}), s.length > 0 && (n = s[0]), a.length > 0 && n && (o = !0, a = a.slice(1, a.length), r = r.slice(1, r.length)), l = f.tagging.fct(f.search), l.isTag = !0, r.filter(function (e) {
                            return angular.equals(e, f.tagging.fct(f.search))
                        }).length > 0)return
                } else {
                    if (s = f.$filter("filter")(a, function (e) {
                            return e.match(f.taggingLabel)
                        }), s.length > 0 && (n = s[0]), i = a[0], void 0 !== i && a.length > 0 && n && (o = !0, a = a.slice(1, a.length), r = r.slice(1, r.length)), l = f.search + " " + f.taggingLabel, p(f.selected, f.search) > -1)return;
                    if (d(r.concat(f.selected)))return void(o && (a = r, t.$evalAsync(function () {
                        f.activeIndex = 0, f.items = a
                    })));
                    if (d(r))return void(o && (f.items = r.slice(1, r.length)))
                }
                o && (u = p(f.selected, l)), u > -1 ? a = a.slice(u + 1, a.length - 1) : (a = [], a.push(l), a = a.concat(r)), t.$evalAsync(function () {
                    f.activeIndex = 0, f.items = a
                })
            }
        }), m.on("tagged", function () {
            l(function () {
                r()
            })
        }), m.on("blur", function () {
            l(function () {
                f.activeMatchIndex = -1
            })
        }), t.$on("$destroy", function () {
            m.off("keyup keydown tagged blur")
        })
    }]).directive("uiSelect", ["$document", "uiSelectConfig", "uiSelectMinErr", "$compile", "$parse", function (t, c, l, i, s) {
        return {
            restrict: "EA",
            templateUrl: function (e, t) {
                var l = t.theme || c.theme;
                return l + (angular.isDefined(t.multiple) ? "/select-multiple.tpl.html" : "/select.tpl.html")
            },
            replace: !0,
            transclude: !0,
            require: ["uiSelect", "ngModel"],
            scope: !0,
            controller: "uiSelectCtrl",
            controllerAs: "$select",
            link: function (n, a, r, o, u) {
                function d(e) {
                    var t = !1;
                    t = window.jQuery ? window.jQuery.contains(a[0], e.target) : a[0].contains(e.target), t || p.clickTriggeredSelect || (p.close(angular.element(e.target).closest(".ui-select-container.open").length > 0), n.$digest()), p.clickTriggeredSelect = !1
                }

                var p = o[0], h = o[1], g = a.querySelectorAll("input.ui-select-search");
                p.multiple = angular.isDefined(r.multiple) && ("" === r.multiple || "multiple" === r.multiple.toLowerCase() || "true" === r.multiple.toLowerCase()), p.closeOnSelect = function () {
                    return angular.isDefined(r.closeOnSelect) ? s(r.closeOnSelect)() : c.closeOnSelect
                }(), p.onSelectCallback = s(r.onSelect), p.onRemoveCallback = s(r.onRemove), h.$parsers.unshift(function (e) {
                    var t, c = {};
                    if (p.multiple) {
                        for (var l = [], i = p.selected.length - 1; i >= 0; i--)c = {}, c[p.parserResult.itemName] = p.selected[i], t = p.parserResult.modelMapper(n, c), l.unshift(t);
                        return l
                    }
                    return c = {}, c[p.parserResult.itemName] = e, t = p.parserResult.modelMapper(n, c)
                }), h.$formatters.unshift(function (e) {
                    var t, c = p.parserResult.source(n, {$select: {search: ""}}), l = {};
                    if (c) {
                        if (p.multiple) {
                            var i = [], s = function (e, c) {
                                if (e && e.length) {
                                    for (var s = e.length - 1; s >= 0; s--)if (l[p.parserResult.itemName] = e[s], t = p.parserResult.modelMapper(n, l), t == c)return i.unshift(e[s]), !0;
                                    return !1
                                }
                            };
                            if (!e)return i;
                            for (var a = e.length - 1; a >= 0; a--)s(p.selected, e[a]) || s(c, e[a]);
                            return i
                        }
                        var r = function (c) {
                            return l[p.parserResult.itemName] = c, t = p.parserResult.modelMapper(n, l), t == e
                        };
                        if (p.selected && r(p.selected))return p.selected;
                        for (var o = c.length - 1; o >= 0; o--)if (r(c[o]))return c[o]
                    }
                    return e
                }), p.ngModel = h, p.choiceGrouped = function (e) {
                    return p.isGrouped && e && e.name
                };
                var f = angular.element("<input ng-disabled='$select.disabled' class='ui-select-focusser ui-select-offscreen' type='text' aria-haspopup='true' role='button' />");
                r.tabindex && r.$observe("tabindex", function (e) {
                    p.multiple ? g.attr("tabindex", e) : f.attr("tabindex", e), a.removeAttr("tabindex")
                }), i(f)(n), p.focusser = f, p.multiple || (a.append(f), f.bind("focus", function () {
                    n.$evalAsync(function () {
                        p.focus = !0
                    })
                }), f.bind("blur", function () {
                    n.$evalAsync(function () {
                        p.focus = !1
                    })
                }), f.bind("keydown", function (t) {
                    return t.which === e.BACKSPACE ? (t.preventDefault(), t.stopPropagation(), p.select(void 0), void n.$apply()) : void(t.which === e.TAB || e.isControl(t) || e.isFunctionKey(t) || t.which === e.ESC || ((t.which == e.DOWN || t.which == e.UP || t.which == e.ENTER || t.which == e.SPACE) && (t.preventDefault(), t.stopPropagation(), p.activate()), n.$digest()))
                }), f.bind("keyup input", function (t) {
                    t.which === e.TAB || e.isControl(t) || e.isFunctionKey(t) || t.which === e.ESC || t.which == e.ENTER || t.which === e.BACKSPACE || (p.activate(f.val()), f.val(""), n.$digest())
                })), n.$watch("searchEnabled", function () {
                    var e = n.$eval(r.searchEnabled);
                    p.searchEnabled = void 0 !== e ? e : c.searchEnabled
                }), r.$observe("disabled", function () {
                    p.disabled = void 0 !== r.disabled ? r.disabled : !1
                }), r.$observe("resetSearchInput", function () {
                    var e = n.$eval(r.resetSearchInput);
                    p.resetSearchInput = void 0 !== e ? e : !0
                }), r.$observe("tagging", function () {
                    if (void 0 !== r.tagging) {
                        var e = n.$eval(r.tagging);
                        p.tagging = {isActivated: !0, fct: e !== !0 ? e : void 0}
                    } else p.tagging = {isActivated: !1, fct: void 0}
                }), r.$observe("taggingLabel", function () {
                    void 0 !== r.tagging && (p.taggingLabel = "false" === r.taggingLabel ? !1 : void 0 !== r.taggingLabel ? r.taggingLabel : "(new)")
                }), r.$observe("taggingTokens", function () {
                    if (void 0 !== r.tagging) {
                        var e = void 0 !== r.taggingTokens ? r.taggingTokens.split("|") : [",", "ENTER"];
                        p.taggingTokens = {isActivated: !0, tokens: e}
                    }
                }), p.multiple ? (n.$watchCollection(function () {
                    return h.$modelValue
                }, function (e, t) {
                    t != e && (h.$modelValue = null)
                }), p.firstPass = !0, n.$watchCollection("$select.selected", function () {
                    p.firstPass ? p.firstPass = !1 : h.$setViewValue(Date.now())
                }), f.prop("disabled", !0)) : n.$watch("$select.selected", function (e) {
                    h.$viewValue !== e && h.$setViewValue(e)
                }), h.$render = function () {
                    if (p.multiple && !angular.isArray(h.$viewValue)) {
                        if (!angular.isUndefined(h.$viewValue) && null !== h.$viewValue)throw l("multiarr", "Expected model value to be array but got '{0}'", h.$viewValue);
                        p.selected = []
                    }
                    p.selected = h.$viewValue
                }, t.on("click", d), n.$on("$destroy", function () {
                    t.off("click", d)
                }), u(n, function (e) {
                    var t = angular.element("<div>").append(e), c = t.querySelectorAll(".ui-select-match");
                    if (c.removeAttr("ui-select-match"), 1 !== c.length)throw l("transcluded", "Expected 1 .ui-select-match but got '{0}'.", c.length);
                    a.querySelectorAll(".ui-select-match").replaceWith(c);
                    var i = t.querySelectorAll(".ui-select-choices");
                    if (i.removeAttr("ui-select-choices"), 1 !== i.length)throw l("transcluded", "Expected 1 .ui-select-choices but got '{0}'.", i.length);
                    a.querySelectorAll(".ui-select-choices").replaceWith(i)
                })
            }
        }
    }]).directive("uiSelectChoices", ["uiSelectConfig", "RepeatParser", "uiSelectMinErr", "$compile", function (e, t, c, l) {
        return {
            restrict: "EA", require: "^uiSelect", replace: !0, transclude: !0, templateUrl: function (t) {
                var c = t.parent().attr("theme") || e.theme;
                return c + "/choices.tpl.html"
            }, compile: function (i, s) {
                if (!s.repeat)throw c("repeat", "Expected 'repeat' expression.");
                return function (i, s, n, a, r) {
                    var o = n.groupBy;
                    if (a.parseRepeatAttr(n.repeat, o), a.disableChoiceExpression = n.uiDisableChoice, a.onHighlightCallback = n.onHighlight, o) {
                        var u = s.querySelectorAll(".ui-select-choices-group");
                        if (1 !== u.length)throw c("rows", "Expected 1 .ui-select-choices-group but got '{0}'.", u.length);
                        u.attr("ng-repeat", t.getGroupNgRepeatExpression())
                    }
                    var d = s.querySelectorAll(".ui-select-choices-row");
                    if (1 !== d.length)throw c("rows", "Expected 1 .ui-select-choices-row but got '{0}'.", d.length);
                    d.attr("ng-repeat", t.getNgRepeatExpression(a.parserResult.itemName, "$select.items", a.parserResult.trackByExp, o)).attr("ng-if", "$select.open").attr("ng-mouseenter", "$select.setActiveItem(" + a.parserResult.itemName + ")").attr("ng-click", "$select.select(" + a.parserResult.itemName + ",false,$event)");
                    var p = s.querySelectorAll(".ui-select-choices-row-inner");
                    if (1 !== p.length)throw c("rows", "Expected 1 .ui-select-choices-row-inner but got '{0}'.", p.length);
                    p.attr("uis-transclude-append", ""), l(s, r)(i), i.$watch("$select.search", function (e) {
                        e && !a.open && a.multiple && a.activate(!1, !0), a.activeIndex = a.tagging.isActivated ? -1 : 0, a.refresh(n.refresh)
                    }), n.$observe("refreshDelay", function () {
                        var t = i.$eval(n.refreshDelay);
                        a.refreshDelay = void 0 !== t ? t : e.refreshDelay
                    })
                }
            }
        }
    }]).directive("uisTranscludeAppend", function () {
        return {
            link: function (e, t, c, l, i) {
                i(e, function (e) {
                    t.append(e)
                })
            }
        }
    }).directive("uiSelectMatch", ["uiSelectConfig", function (e) {
        return {
            restrict: "EA", require: "^uiSelect", replace: !0, transclude: !0, templateUrl: function (t) {
                var c = t.parent().attr("theme") || e.theme, l = t.parent().attr("multiple");
                return c + (l ? "/match-multiple.tpl.html" : "/match.tpl.html")
            }, link: function (t, c, l, i) {
                i.lockChoiceExpression = l.uiLockChoice, l.$observe("placeholder", function (t) {
                    i.placeholder = void 0 !== t ? t : e.placeholder
                }), i.allowClear = angular.isDefined(l.allowClear) ? "" === l.allowClear ? !0 : "true" === l.allowClear.toLowerCase() : !1, i.multiple && i.sizeSearchInput()
            }
        }
    }]).filter("highlight", function () {
        function e(e) {
            return e.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
        }

        return function (t, c) {
            return c && t ? t.replace(new RegExp(e(c), "gi"), '<span class="ui-select-highlight">$&</span>') : t
        }
    })
}(), angular.module("ui.select").run(["$templateCache", function (e) {
        e.put("bootstrap/choices.tpl.html", '<ul class="ui-select-choices ui-select-choices-content dropdown-menu" role="menu" aria-labelledby="dLabel" ng-show="$select.items.length > 0">' + '<li class="ui-select-choices-group"><div class="divider" ng-show="$select.isGrouped && $index > 0"></div><div ng-show="$select.isGrouped" class="ui-select-choices-group-label dropdown-header" ng-bind-html="$group.name"></div><div class="ui-select-choices-row" ng-class="{active: $select.isActive(this), disabled: $select.isDisabled(this)}"><a href="javascript:void(0)" class="ui-select-choices-row-inner"></a></div></li></ul>'),
        e.put("bootstrap/match-multiple.tpl.html", '<span class="ui-select-match">' + '<span ng-repeat="$item in $select.selected"><span style="margin-right: 3px;" class="ui-select-match-item btn btn-default btn-xs" tabindex="-1" type="button" ng-disabled="$select.disabled" ng-click="$select.activeMatchIndex = $index;" ng-class="{\'btn-primary\':$select.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}"><span class="close ui-select-match-close" ng-hide="$select.disabled" ng-click="$select.removeChoice($index)">&nbsp;&times;</span> <span uis-transclude-append=""></span></span></span></span>'),
        e.put("bootstrap/match.tpl.html", '<div class="ui-select-match" ng-hide="$select.open" ng-disabled="$select.disabled" ng-class="{\'btn-default-focus\':$select.focus}"><button type="button" class="btn btn-default btn-block ui-select-toggle" tabindex="-1" ;="" ng-disabled="$select.disabled" ng-click="$select.activate()"><span ng-show="$select.isEmpty()" class="ui-select-placeholder text-muted">{{$select.placeholder}}</span> <span ng-hide="$select.isEmpty()" class="ui-select-match-text" ng-class="{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}" ng-transclude=""></span> <i class="caret pull-right" ng-click="$select.toggle($event)"></i></button> <button type="button" class="ui-select-clear" ng-if="$select.allowClear && !$select.isEmpty()" ng-click="$select.select(undefined)"><i class="glyphicon glyphicon-remove"></i></button></div>'),
        e.put("bootstrap/select-multiple.tpl.html", '<div class="ui-select-container ui-select-multiple ui-select-bootstrap dropdown form-control" ng-class="{open: $select.open}"><div><div class="ui-select-match"></div><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="ui-select-search input-xs" placeholder="{{$select.getPlaceholder()}}" ng-disabled="$select.disabled" ng-hide="$select.disabled" ng-click="$select.activate()" ng-model="$select.search"></div><div class="ui-select-choices"></div></div>'),
        e.put("bootstrap/select.tpl.html", '<div class="ui-select-container ui-select-bootstrap dropdown" ng-class="{open: $select.open}"><div class="ui-select-match"></div><input type="text" autocomplete="off" tabindex="-1" class="form-control ui-select-search" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-show="$select.searchEnabled && $select.open"><div class="ui-select-choices"></div></div>'),
        e.put("select2/choices.tpl.html", '<ul class="ui-select-choices ui-select-choices-content select2-results"><li class="ui-select-choices-group" ng-class="{\'select2-result-with-children\': $select.choiceGrouped($group) }"><div ng-show="$select.choiceGrouped($group)" class="ui-select-choices-group-label select2-result-label" ng-bind-html="$group.name"></div><ul ng-class="{\'select2-result-sub\': $select.choiceGrouped($group), \'select2-result-single\': !$select.choiceGrouped($group) }"><li class="ui-select-choices-row" ng-class="{\'select2-highlighted\': $select.isActive(this), \'select2-disabled\': $select.isDisabled(this)}"><div class="select2-result-label ui-select-choices-row-inner"></div></li></ul></li></ul>'),
        e.put("select2/match-multiple.tpl.html", '<span class="ui-select-match"><li class="ui-select-match-item select2-search-choice" ng-repeat="$item in $select.selected" ng-class="{\'select2-search-choice-focus\':$select.activeMatchIndex === $index, \'select2-locked\':$select.isLocked(this, $index)}"><span uis-transclude-append=""></span> <a href="javascript:;" class="ui-select-match-close select2-search-choice-close" ng-click="$select.removeChoice($index)" tabindex="-1"></a></li></span>'),
        e.put("select2/match.tpl.html", '<a class="select2-choice ui-select-match" ng-class="{\'select2-default\': $select.isEmpty()}" ng-click="$select.activate()"><span ng-show="$select.isEmpty()" class="select2-chosen">{{$select.placeholder}}</span> <span ng-hide="$select.isEmpty()" class="select2-chosen" ng-transclude=""></span> <abbr ng-if="$select.allowClear && !$select.isEmpty()" class="select2-search-choice-close" ng-click="$select.select(undefined)"></abbr> <span class="select2-arrow ui-select-toggle" ng-click="$select.toggle($event)"><b></b></span></a>'),
        e.put("select2/select-multiple.tpl.html", '<div class="ui-select-container ui-select-multiple select2 select2-container select2-container-multi" ng-class="{\'select2-container-active select2-dropdown-open open\': $select.open,\n                \'select2-container-disabled\': $select.disabled}"><ul class="select2-choices"><span class="ui-select-match"></span><li class="select2-search-field"><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="select2-input ui-select-search" placeholder="{{$select.getPlaceholder()}}" ng-disabled="$select.disabled" ng-hide="$select.disabled" ng-model="$select.search" ng-click="$select.activate()" style="width: 34px;"></li></ul><div class="select2-drop select2-with-searchbox select2-drop-active" ng-class="{\'select2-display-none\': !$select.open}"><div class="ui-select-choices"></div></div></div>'),
        e.put("select2/select.tpl.html", '<div class="ui-select-container select2 select2-container" ng-class="{\'select2-container-active select2-dropdown-open open\': $select.open,\n                \'select2-container-disabled\': $select.disabled,\n                \'select2-container-active\': $select.focus, \n                \'select2-allowclear\': $select.allowClear && !$select.isEmpty()}"><div class="ui-select-match"></div><div class="select2-drop select2-with-searchbox select2-drop-active" ng-class="{\'select2-display-none\': !$select.open}"><div class="select2-search" ng-show="$select.searchEnabled"><input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="ui-select-search select2-input" ng-model="$select.search"></div><div class="ui-select-choices"></div></div></div>'),
        e.put("selectize/choices.tpl.html", '<div ng-show="$select.open" class="ui-select-choices selectize-dropdown single"><div class="ui-select-choices-content selectize-dropdown-content"><div class="ui-select-choices-group optgroup"><div ng-show="$select.isGrouped" class="ui-select-choices-group-label optgroup-header" ng-bind-html="$group.name"></div><div class="ui-select-choices-row" ng-class="{active: $select.isActive(this), disabled: $select.isDisabled(this)}"><div class="option ui-select-choices-row-inner" data-selectable=""></div></div></div></div></div>'),
        e.put("selectize/match.tpl.html", '<div ng-hide="($select.open || $select.isEmpty())" class="ui-select-match" ng-transclude=""></div>'),
            e.put("selectize/select.tpl.html", '<div class="ui-select-container selectize-control single" ng-class="{\'open\': $select.open}"><div class="selectize-input" ng-class="{\'focus\': $select.open, \'disabled\': $select.disabled, \'selectize-focus\' : $select.focus}" ng-click="$select.activate()"><div class="ui-select-match"></div><input type="text" autocomplete="off" tabindex="-1" class="ui-select-search ui-select-toggle" ng-click="$select.toggle($event)" placeholder="{{$select.placeholder}}" ng-model="$select.search" ng-hide="!$select.searchEnabled || ($select.selected && !$select.open)" ng-disabled="$select.disabled"></div><div class="ui-select-choices"></div></div>')
}]);