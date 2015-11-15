import Ember from 'ember';

export default Ember.Route.extend({
  model: function(model) {
    // assigning the username to a random string for now
    let username = Math.random().toString(32).split('.')[1];

    // TODO Use Firebase Auth User
    let user = this.store.createRecord('user', {
      id: username,
      username: username,
    });
    user.save();

    return user;
  },
});
