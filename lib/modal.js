// Wrapper for creating Bootstrap Modal

require('./vendor/modal');

var Modal = function(content) {
    var $modal = $('' +
        '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '</div>' +
            '</div>' +
        '</div>');

    $('.modal-content', $modal).append(content);

    $modal.modal({ show: false }).appendTo('body');

    this.$modal = $modal;
};

Modal.prototype.show = function() {
    this.$modal.modal('show');
};

Modal.prototype.hide = function() {
    this.$modal.modal('hide');
};

module.exports = Modal;
