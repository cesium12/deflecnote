"use strict";

function Note(data) {
  $.extend(this, data);
  var self = this;

  this.targets = [new Target(data)];
  $.each(this.linked || [], function(_, link) {
    self.targets.push(new Target(data, link));
  });
}

Note.prototype.step = function(now) {
  var alive = false;
  this.targets = $.grep(this.targets, function(target) {
    alive = target.step(now) || alive;
    return !target.done;
  });
  if (this.targets.length > 1 && this.targets[0].opacity == 1) {
    background.link(this.targets[0].color, this.targets);
  }
  if (!alive) {
    $.each(this.targets, function(_, target) {
      target.elt.remove();
    });
  }
  return alive;
};
