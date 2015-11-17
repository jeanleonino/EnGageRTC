import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller('application'),

  actions: {
    submit: function() {
      this.transitionToRoute('room', this.get('room'));
    },
  },
});
