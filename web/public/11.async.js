(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[11],{CIFC:function(e,t,l){"use strict";var a=l("TqRt"),r=l("284h");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,l("IzEo");var d=a(l("bx4M"));l("+L6B");var u=a(l("2/Rp"));l("/zsF");var n=a(l("PArb"));l("Pwec");var m=a(l("CtXQ"));l("giR+");var f=a(l("fyUT"));l("5NDa");var s=a(l("5rEg"));l("jCWc");var c=a(l("kPKH"));l("14J3");var i=a(l("BMrR"));l("miYZ");var o=a(l("tsqr")),p=a(l("MVZn")),E=a(l("lwsE")),b=a(l("W8MJ")),g=a(l("a1gu")),h=a(l("Nsbk")),y=a(l("7W2i"));l("y8nQ");var v=a(l("Vl3Y"));l("OaEy");var _,w,x,q=a(l("2fM7")),F=r(l("q1tI")),k=l("MuoO"),M=a(l("a8aH")),B=q.default.Option,S=v.default.Item,V=(_=(0,k.connect)(function(e){var t=e.install,l=e.loading;return{install:t,submitting:l.effects["install/store"]}}),w=v.default.create(),_(x=w(x=function(e){function t(){var e,l;(0,E.default)(this,t);for(var a=arguments.length,r=new Array(a),d=0;d<a;d++)r[d]=arguments[d];return l=(0,g.default)(this,(e=(0,h.default)(t)).call.apply(e,[this].concat(r))),l.state={},l.handSubmit=function(e){e.preventDefault();var t=l.props,a=t.dispatch,r=t.form;r.validateFields(function(e,t){if(!e){var l=(0,p.default)({},t);if(l.admin_password&&l.confirm_admin_password&&l.admin_password===l.confirm_admin_password){l.db_table_prefix=l.db_table_prefix?l.db_table_prefix:"";var d=new FormData;Object.keys(l).forEach(function(e){d.append(e,l[e])}),a({type:"install/store",payload:d,callback:function(){r.resetFields()}})}else o.default.error("\u5bc6\u7801\u8f93\u5165\u4e0d\u5339\u914d")}})},l.renderForm=function(){var e=l.props,t=e.form,a=e.submitting,r=t.getFieldDecorator;return F.default.createElement(v.default,{onSubmit:l.handSubmit,layout:"inline"},F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement("h2",null,"\u6570\u636e\u5e93\u914d\u7f6e")),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u6570\u636e\u5e93"},r("db_type",{rules:[{required:!0,message:"\u8bf7\u9009\u62e9\u6570\u636e\u5e93..."}]})(F.default.createElement(q.default,{style:{width:"100%"},placeholder:"\u8bf7\u9009\u62e9\u6570\u636e\u5e93"},F.default.createElement(B,{value:"mysql"},"MySql"),F.default.createElement(B,{value:"postgres"},"PostgreSql")))))),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u4e3b\u673a\u540d"},r("db_host",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u4e3b\u673a\u540d..."}]})(F.default.createElement(s.default,{placeholder:"\u8bf7\u8f93\u5165\u4e3b\u673a\u540d"})))),F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u7aef\u53e3"},r("db_port",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u7aef\u53e3..."}]})(F.default.createElement(f.default,{min:1,style:{width:"100%"},placeholder:"\u8bf7\u8f93\u5165\u7aef\u53e3"}))))),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u7528\u6237\u540d"},r("db_username",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u7528\u6237\u540d..."}]})(F.default.createElement(s.default,{placeholder:"\u8bf7\u8f93\u5165\u7528\u6237\u540d"})))),F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u5bc6\u7801"},r("db_password",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u7528\u6237\u540d..."}]})(F.default.createElement(s.default,{prefix:F.default.createElement(m.default,{type:"lock",style:{color:"rgba(0,0,0,.25)"}}),type:"password",placeholder:"\u8bf7\u8f93\u5165\u5bc6\u7801"}))))),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u6570\u636e\u5e93\u540d\u79f0"},r("db_name",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u6570\u636e\u5e93\u540d\u79f0..."}]})(F.default.createElement(s.default,{placeholder:"\u5982\u679c\u6570\u636e\u5e93\u4e0d\u5b58\u5728\uff0c\u9700\u8981\u63d0\u524d\u521b\u5efa"})))),F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u8868\u524d\u7f00"},r("db_table_prefix",{})(F.default.createElement(s.default,{placeholder:"\u8bf7\u8f93\u5165\u8868\u524d\u7f00"}))))),F.default.createElement(n.default,{type:"horizontal"}),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement("h2",null,"\u7ba1\u7406\u5458\u8d26\u53f7\u914d\u7f6e")),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u8d26\u53f7"},r("admin_username",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u8d26\u53f7..."}]})(F.default.createElement(s.default,{placeholder:"\u8bf7\u8f93\u5165\u8d26\u53f7"})))),F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u90ae\u7bb1"},r("admin_email",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u90ae\u7bb1..."},{type:"email",message:"\u8bf7\u8f93\u5165\u5408\u6cd5\u7684\u90ae\u7bb1\u5730\u5740..."}]})(F.default.createElement(s.default,{prefix:F.default.createElement(m.default,{type:"mail",style:{color:"rgba(0,0,0,.25)"}}),type:"mail",placeholder:"\u8bf7\u8f93\u5165\u90ae\u7bb1"}))))),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u5bc6\u7801"},r("admin_password",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u7528\u6237\u540d..."}]})(F.default.createElement(s.default,{prefix:F.default.createElement(m.default,{type:"lock",style:{color:"rgba(0,0,0,.25)"}}),type:"password",placeholder:"\u8bf7\u8f93\u5165\u5bc6\u7801"})))),F.default.createElement(c.default,{md:6,sm:24},F.default.createElement(S,{label:"\u786e\u8ba4\u5bc6\u7801"},r("confirm_admin_password",{rules:[{required:!0,message:"\u8bf7\u8f93\u5165\u786e\u8ba4\u5bc6\u7801..."}]})(F.default.createElement(s.default,{prefix:F.default.createElement(m.default,{type:"lock",style:{color:"rgba(0,0,0,.25)"}}),type:"password",placeholder:"\u8bf7\u8f93\u5165\u786e\u8ba4\u5bc6\u7801"}))))),F.default.createElement(i.default,{gutter:{md:8,lg:24,xl:48}},F.default.createElement(c.default,{md:6,sm:24},F.default.createElement("span",{className:M.default.submitButtons},F.default.createElement(u.default,{loading:a,type:"primary",htmlType:"submit"},"\u5b89\u88c5")))))},l.handleModalVisible=function(e){l.setState({modalVisible:!!e})},l}return(0,y.default)(t,e),(0,b.default)(t,[{key:"render",value:function(){var e=this.state;e.modalVisible,e.users,this.handleAdd,this.setForm,this.handleModalVisible;return F.default.createElement(F.Fragment,null,F.default.createElement(d.default,{style:{marginBottom:12}},F.default.createElement("div",{className:M.default.tableListForm},this.renderForm())))}}]),t}(F.Component))||x)||x),C=V;t.default=C},a8aH:function(e,t,l){e.exports={tableListForm:"antd-pro\\github.com\\linthan\\gocron\\web\\react\\src\\pages\\-install-tableListForm",submitButtons:"antd-pro\\github.com\\linthan\\gocron\\web\\react\\src\\pages\\-install-submitButtons"}}}]);