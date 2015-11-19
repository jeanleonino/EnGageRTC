import DS from 'ember-data';

export default DS.Model.extend({
  from: DS.attr('string'),
  info: DS.attr('string'),
});
