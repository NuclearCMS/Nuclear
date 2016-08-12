// GENERAL LABEL HIGHLIGHTERS
$('.form-group input, .form-group textarea').focus(function () {
    $(this).closest('.form-group').find('.form-group__label').addClass('form-group__label--focus');
});

$('.form-group input, .form-group textarea').blur(function () {
    $(this).closest('.form-group').find('.form-group__label').removeClass('form-group__label--focus');
});

// LOCATE FORM BUTTONS
var formContainer = $('#content'),
    formButtons = $('#formButtons');

function locateFormButtons() {
    var wH = $(window).height(),
        fcH = formContainer.outerHeight();

    // This 12px thing is because of the content container needs to have an
    // extra of 12px bottom padding in order to ensure scrollbar not showing
    if ((wH + 12) > fcH) {
        formButtons.css('bottom', (wH - fcH + 28) + 'px');
    } else {
        formButtons.css('bottom', '');
    }
}

locateFormButtons();
$(window).on('resize.formbuttons', function () {
    locateFormButtons();
});
//# sourceMappingURL=forms.js.map