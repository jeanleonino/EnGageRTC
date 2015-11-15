import Ember from 'ember';

export default Ember.Controller.extend({
  application: Ember.inject.controller('application'),

  actions: {
    submit: function() {
      // TODO Make a fail-safe createRecord query by verifying if a record for
      // the given room already exists
      this.store.createRecord('room', {
        id: this.get('room'),
        users: [this.get('application.model')],
      }).save();
    },
  },
});
