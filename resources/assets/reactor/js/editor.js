;(function (window) {
    'use strict';

    // Editor constructor
    function Editor(el, library, dialog) {
        this._init(el, library, dialog);
    }

    // Editor app
    Editor.prototype = {

        /**
         * Initialises app
         *
         * @param DOM
         */
        _init: function (el, library, dialog) {
            this.el = el;
            this.editorContainer = el.find('.markdown-editor-container');
            this.text = this.el.find('textarea');
            this.library = library;
            this.dialog = dialog;

            this.enabled = true;

            this.previewurl = this.editorContainer.data('previewurl');
            this.requestingPreview = false;

            this.markdownPreviewContainer = el.find('.markdown-preview-container');
            this.markdownPreview = this.markdownPreviewContainer.find('.markdown-body');

            // Temporary cache for cursor start
            // currently only used for the link modal due to a chrome bug
            this.cursorStart = null;

            this.toolbar = this.el.find('.markdown-editor-toolbar');

            this._controls();

            this._initEvents();
        },

        /**
         * Initialises the events for the editor
         */
        _initEvents: function () {
            var self = this;

            // Resize the textarea
            this.text.height(0).height(this.text.prop('scrollHeight') + 'px');

            // Bind resize events
            this.text.on('propertychange input change keyup keydown paste cut', function () {
                self.resize();
            }).change();

            $(window).resize(function () {
                self.delayedResize();
            });

            // Bind tabbing
            this.text.on('keydown', function (e) {
                if (e.keyCode === 9) {
                    e.stopPropagation();
                    e.preventDefault();

                    if (e.shiftKey && e.keyCode === 9) {
                        self.flush(e);
                    } else {
                        self.indent(e);
                    }
                }
            });

            // Set tool clicks
            this.toolbar.on('click', '.toolset li', function () {
                if (!self.enabled) {
                    return false;
                }

                var method = $(this).data('method');

                if (self.controls[method]) {
                    self.controls[method]();
                }

                return false;
            });

            this.markdownPreviewContainer.find('.markdown-hide-preview').click(function () {
                self._hidePreview();
            });
        },

        /**
         * Returns the gallery controller
         */
        _getGalleryController: function () {
            return new EditorGallery(this, this.library);
        },

        /*
         * Returns the document controller
         */
        _getDocumentController: function () {
            return new EditorDocument(this, this.library);
        },

        /**
         * Resizes the textarea for each line
         */
        resize: function () {
            var bodyScrollPos = Math.max($('body').prop('scrollTop'), $('html').prop('scrollTop'));
            this.text.height(0).height(this.text.prop('scrollHeight') + 'px');
            $('html,body').prop('scrollTop', bodyScrollPos);
        },

        /* 0-timeout to get the already changed text */
        delayedResize: function () {
            var self = this;
            var timeout = setTimeout(function () {
                self.resize();
            }, 0);
        },

        /**
         * Inserts string at the cursor
         *
         * @param string
         */
        insert: function (str) {
            var element = this.text[0];

            var start = element.selectionStart;
            var value = element.value;

            element.value = value.substring(0, start) + str + value.substring(start);

            element.selectionEnd = start + str.length;

            this.resize();
        },

        /**
         * Inserts string at the given start and end
         *
         * @param string
         */
        insertAt: function (str, start) {
            var element = this.text[0],
                value = element.value;

            element.value = value.substring(0, start) + str + value.substring(start);

            element.selectionStart = start, element.selectionEnd = start + str.length;

            this.resize();
        },

        /**
         * Removes selected string
         */
        deleteSelection: function () {
            var element = this.text[0];

            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            element.value = value.substring(0, start) + value.substring(end);

            this.resize();
        },

        /**
         * Wraps selection with given params
         */
        wrap: function (left, right) {
            var element = this.text[0];

            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            element.value = value.substring(0, start) + left + value.substring(start, end) + right + value.substring(end);

            element.selectionStart = start;
            element.selectionEnd = end + left.length + right.length;

            this.resize();
        },

        /**
         * Tabs all lines in the selection
         */
        indent: function (e) {
            var element = this.text[0];

            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            var selections = value.substring(start, end).split("\n");

            for (var i = 0; i < selections.length; i++) {
                selections[i] = "\t" + selections[i];
            }

            element.value = value.substring(0, start) + selections.join("\n") + value.substring(end);

            if (end > start) {
                element.selectionStart = start;
                element.selectionEnd = end + selections.length;
            } else {
                element.selectionStart = element.selectionEnd = start + 1;
            }

            this.resize();
        },
        /**
         * Untabs all lines in the selection
         */
        flush: function (e) {
            var element = this.text[0];

            var start = element.selectionStart, end = element.selectionEnd;
            var value = element.value;

            var pattern = new RegExp(/^[\t]{1}/);

            var edits = 0;

            if (start === end) {
                while (start > 0) {
                    if (value.charAt(start) === "\n") {
                        start++;
                        break;
                    }

                    start--;
                }

                var portion = value.substring(start, end);
                var matches = portion.match(pattern);

                if (matches) {
                    element.value = value.substring(0, start) + portion.replace(pattern, '') + value.substring(end);
                    end--;
                }

                element.selectionStart = element.selectionEnd = end;
            } else {
                var selections = value.substring(start, end).split("\n");

                for (var i = 0; i < selections.length; i++) {
                    if (selections[i].match(pattern)) {
                        edits++;
                        selections[i] = selections[i].replace(pattern, '');
                    }
                }

                element.value = value.substring(0, start) + selections.join("\n") + value.substring(end);

                element.selectionStart = start;
                element.selectionEnd = end - edits;
            }

            this.resize();
        },

        /**
         * Shows a preview
         */
        _showPreview: function (data) {
            this.editorContainer.addClass('preview');
            this.markdownPreview.html(data);
        },

        /**
         * Shows a preview
         */
        _hidePreview: function () {
            this.editorContainer.removeClass('preview');
            this.markdownPreview.html('');

            this.requestingPreview = false;

            this._enable();
        },

        /**
         * Disables the editor
         */
        _enable: function () {
            this.enabled = true;
            this.text.removeAttr('disabled');
            this.text.removeClass('disabled');
            this.toolbar.removeClass('disabled');
        },

        /**
         * Disables the editor
         */
        _disable: function () {
            this.enabled = false;
            this.text.attr('disabled', 'disabled');
            this.text.addClass('disabled');
            this.toolbar.addClass('disabled');
        },

        /**
         * Sets the editor controls
         */
        _controls: function () {
            var self = this;

            this.controls = {
                bold: function () {
                    self.wrap('**', '**');
                },
                italic: function () {
                    self.wrap('*', '*');
                },
                sup: function () {
                    self.wrap('<sup>', '</sup>');
                },
                sub: function () {
                    self.wrap('<sub>', '</sub>');
                },
                code: function () {
                    self.wrap('`', '`');
                },
                link: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var selection = value.substring(start, end);

                    self.cursorStart = start;

                    self.dialog.run(self, 'link');

                    self.dialog.textInput.val(selection);
                    self.dialog.urlInput.focus();
                },
                list: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var selections = value.substring(start, end).split("\n");

                    for (var i = 0; i < selections.length; i++) {
                        selections[i] = '* ' + selections[i];
                    }

                    element.value = value.substring(0, start) + "\n" + selections.join("\n") + "\n" + value.substring(end);

                    self.resize();
                },
                quote: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var selections = value.substring(start, end).split("\n");

                    for (var i = 0; i < selections.length; i++) {
                        selections[i] = '> ' + selections[i];
                    }

                    element.value = value.substring(0, start) + selections.join("\n") + value.substring(end);

                    self.resize();
                },
                heading: function () {
                    self.wrap('###', '');
                },
                hrule: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var ruler = '\n***\n';

                    element.value = value.substring(0, start) + ruler + value.substring(end);

                    element.selectionStart = element.selectionEnd = end + ruler.length;

                    self.resize();
                },
                readmore: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var readmore = '\n![READMORE]!\n';

                    element.value = value.substring(0, start) + readmore + value.substring(end);

                    element.selectionStart = element.selectionEnd = end + readmore.length;

                    self.resize();
                },
                media: function () {
                    var element = self.text[0];

                    var start = element.selectionStart, end = element.selectionEnd;
                    var value = element.value;

                    var selection = value.substring(start, end);

                    self.dialog.run(self, 'library');

                    self.dialog.sourceInput.val(selection);

                    self.resize();
                },
                preview: function () {
                    if (!self.requestingPreview) {
                        self.requestingPreview = true;

                        self._disable();

                        $.post(self.previewurl, {text: self.text[0].value}, function (data) {
                            self._showPreview(data);
                        });
                    }
                }
            };
        }

    };

    // Register Editor to window namespace
    window.Editor = Editor;


    // Editor dialog constructor
    function EditorDialog() {
        this._init();
    }

    // Editor dialog prototype
    EditorDialog.prototype = {
        // Initialize
        _init: function () {
            var self = this;

            // Create a new dialog
            this.dialog = new Modal($('#modalEditor'), {
                onConfirmEvent: function (dialog) {
                    if (typeof self.controller != 'undefined' && self.controller !== null) {
                        self._setValue();

                        this.controller = null;
                        this.mode = null;
                    }
                }
            });

            this.controller = null;

            this.mode = null;

            this.container = this.dialog.el.find('.modal');
            this.libraryDialog = this.container.find('.editor-modal-library');
            this.linkDialog = this.container.find('.editor-modal-link');

            this.galleryButton = this.libraryDialog.find('.editor-modal-gallery-button');
            this.mediaButton = this.libraryDialog.find('.editor-modal-document-button');

            this.sourceInput = this.libraryDialog.find('input[name="_src"]');
            this.alttextInput = this.libraryDialog.find('input[name="_alt"]');

            this.urlInput = this.linkDialog.find('input[name="_link"]');
            this.textInput = this.linkDialog.find('input[name="_text"]');
            this.newpageInput = this.linkDialog.find('input[name="_newpage"]');

            this._initEvents();
        },
        // Initializes events
        _initEvents: function () {
            // Cache self
            var self = this;

            // Gallery button
            this.galleryButton.on('click', function (e) {
                self.dialog.closeModal();

                var controller = self.controller._getGalleryController();

                controller.run();

                e.preventDefault();
                e.stopPropagation();
            });

            // Document button
            this.mediaButton.on('click', function (e) {
                self.dialog.closeModal();

                var controller = self.controller._getDocumentController();

                controller.run();

                e.preventDefault();
                e.stopPropagation();
            });
        },
        // Runs the dialog
        run: function (controller, mode) {
            this.setMode(mode);

            this.controller = controller;

            this._reset();

            this.dialog.openModal();
        },
        // Sets the mode
        setMode: function (mode) {
            this.mode = mode;

            this.container.removeClass('library link');
            this.container.addClass(mode);
        },
        // Resets the dialog
        _reset: function () {
            this.sourceInput.val('');
            this.alttextInput.val('');

            this.urlInput.val('');
            this.textInput.val('');
            this.newpageInput.attr('checked', false);
        },
        // Inserts a value depending on mode
        _setValue: function () {
            this.controller.deleteSelection();

            if (this.mode === 'library') {
                this._setValueLibrary();
            } else if (this.mode === 'link') {
                this._setValueLink();
            }
        },
        // Set value as link
        _setValueLink: function () {
            var url = this.urlInput.val();

            if (url.slice(0, 1) !== '#') {
                url = add_http(url);
            }

            var text = (this.textInput.val().length > 0) ? this.textInput.val() : this.urlInput.val();

            if (this.newpageInput.is(':checked')) {
                var str = '<a href="' + url + '" target="_blank">' + text + '</a>';
            } else {
                var str = '[' + text + '](' + url + ')';
            }

            this.controller.insertAt(str, this.controller.cursorStart);
        },
        // Set value as image
        _setValueLibrary: function () {
            this.controller.insert('![' + this.alttextInput.val() + '](' + this.sourceInput.val() + ')');
        }
    };

    // Register editor dialog to window namespace
    window.EditorDialog = EditorDialog;


    // Editor gallery constructor
    function EditorGallery(controller, library) {
        this._init(controller, library);
    }

    // Editor media app
    EditorGallery.prototype = {
        // Initialize
        _init: function (controller, library) {
            this.library = library;

            this.type = 'gallery';

            this.controller = controller;
        },
        // Runs the app
        run: function () {
            this.library.run(this);
        },
        // Get value
        getValue: function () {
            return '';
        },
        // Set value
        setValue: function (media) {
            var array = [];

            for (var i = 0; i < media.length; i++) {
                array.push(media[i].id);
            }

            this.controller.insert('\n[gallery ids="' + array.join(',') + '"]\n');
        }
    };

    // Register editor gallery to window namespace
    window.EditorGallery = EditorGallery;


    // Editor gallery constructor
    function EditorDocument(controller, library) {
        this._init(controller, library);
    }

    // Editor media app
    EditorDocument.prototype = {
        // Initialize
        _init: function (controller, library) {
            this.library = library;

            this.type = 'document';

            this.controller = controller;
        },
        // Runs the app
        run: function () {
            this.library.run(this);
        },
        // Get value
        getValue: function () {
            return '';
        },
        // Set value
        setValue: function (media) {
            this.controller.insert('\n[document id="' + media.id + '"]\n');
        }
    };

    // Register editor media to window namespace
    window.EditorDocument = EditorDocument;

})(window);