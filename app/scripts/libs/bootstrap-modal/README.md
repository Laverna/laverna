Backbone.BootstrapModal
=======================

- Takes care of instantiation and opening/closing modals
- Manages multiple modals
- Adds several options
- Removes the element from the DOM when closed



##Usage

    var view = new Backbone.View({...});
  
    var modal = new Backbone.BootstrapModal({ content: view }).open();


##Events

###cancel
The user dismissed the modal (e.g. pressed cancel or Esc etc.)

###ok
The user clicked OK

###shown.bs.modal
Fired when the modal has finished animating in

###hidden.bs.modal
Fired when the modal has finished animating out

##Events in the view
You can listen to the events triggered by the modal inside the Backbone.View

    var view = new Backbone.View({
        initialize: function () {
            this.bind("ok", okClicked);
        },

        okClicked: function (modal) {
            alert("Ok was clicked");
            modal.preventClose();
        }
    });

    var modal = new Backbone.BootstrapModal({ content: view }).open();

##Methods

###new Backbone.BootstrapModal(options)
Set up the modal with the following options:

- {String|View} [options.content] Modal content. Default: none
- {String} [options.title]        Title. Default: none
- {String} [options.okText]       Text for the OK button. Default: 'OK'
- {Boolean} [options.focusOk]      Wether the 'OK' button should have the focus or not. Default: true
- {Boolean} [options.okCloses]    Wether the modal should close on 'OK' click or not. Default: true
- {String} [options.cancelText]   Text for the cancel button. Default: 'Cancel'. If passed a falsey value, the button will be removed
- {Boolean} [options.allowCancel] Whether the modal can be closed, other than - OK. Default: true
- {Boolean} [options.escape]      Whether the 'esc' key can dismiss the modal- true, but false if options.cancellable is true
- {Boolean} [options.animate]     Whether to animate in/out. Default: false
- {Function} [options.template]   Compiled underscore template to override the default one
- {Object} [options.modalOptions] Options to pass directly to bootstrap-modal


###modal.open([cb])
Renders and opens the modal, running the optional callback if the 'OK' button is pressed


###modal.close()
Close the modal and remove it from the DOM


###modal.preventClose()
Prevents the modal from closing. Can be called from within a 'ok' or 'cancel' event listener:

    var modal = new Backbone.BootstrapModal().open();
  
    modal.on('ok', function() {
      //Do some validation etc.
      if (!isValid) modal.preventClose();
    });

##Live demo
You can read a short article and see live demo on [symfony-world](http://symfony-world.blogspot.com/2013/08/backbone-bootstrap-modal-example.html) blog.
