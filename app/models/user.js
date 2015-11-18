import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  signals: DS.hasMany('signal', {async: true}),
});
