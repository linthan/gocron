(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[7],{TpW2:function(e,t,a){"use strict";var n=a("TqRt");Object.defineProperty(t,"__esModule",{value:!0}),t.queryLog=l,t.cleanLog=i;var r=n(a("o0o1")),u=n(a("yXPU")),s=a("Qyje"),c=n(a("t3Un"));function l(e){return o.apply(this,arguments)}function o(){return o=(0,u.default)(r.default.mark(function e(t){return r.default.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,c.default)("/api/task/log?".concat((0,s.stringify)(t))));case 1:case"end":return e.stop()}},e,this)})),o.apply(this,arguments)}function i(){return p.apply(this,arguments)}function p(){return p=(0,u.default)(r.default.mark(function e(){return r.default.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,c.default)("/api/task/log/clear",{method:"POST"}));case 1:case"end":return e.stop()}},e,this)})),p.apply(this,arguments)}},pM4t:function(e,t,a){"use strict";var n=a("TqRt");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var r=n(a("MVZn"));a("miYZ");var u=n(a("tsqr")),s=n(a("o0o1")),c=a("TpW2"),l=n(a("1I5X")),o={namespace:"tasklog",state:{data:{data:[],total:0}},effects:{fetch:s.default.mark(function e(t,a){var n,r,u,o;return s.default.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return n=t.payload,r=a.call,u=a.put,e.next=4,r(c.queryLog,n);case 4:if(o=e.sent,!(0,l.default)(o)){e.next=8;break}return e.next=8,u({type:"save",payload:o.data});case 8:case"end":return e.stop()}},e,this)}),cleanLog:s.default.mark(function e(t,a){var n,r,o,i;return s.default.wrap(function(e){while(1)switch(e.prev=e.next){case 0:return n=t.payload,r=t.callback,o=a.call,e.next=4,o(c.cleanLog,n);case 4:i=e.sent,(0,l.default)(i)&&(u.default.success(i.message?i.message:"\u64cd\u4f5c\u6210\u529f"),r&&r());case 6:case"end":return e.stop()}},e,this)})},reducers:{save:function(e,t){return(0,r.default)({},e,{data:t.payload})}}};t.default=o}}]);