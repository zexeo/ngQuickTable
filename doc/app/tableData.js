angular.module('ngQuickTable-doc').constant('TABLEDATA', { 
    parsed: {
        def: [
            {
                key:'user',
                order: 0,
                type: "custom",
                tpl: '<img width="50" ng-src="{{record.user.avatar}}" alt="{{record.user.username}}"  />',
                attr: {
                    style: 'text-align:center;',
                }
            },
            {
                key:'基本信息',
                order: 1,
                type:'combined',
                fields:[
                    {
                        key: "姓名",
                        order: 0,
                        type: "input",
                    }, {
                        key: "手机号",
                        order: 1,
                        _id: "54f3d8c6f0d58e0557e6f52f",
                        type: "input",
                    }, {
                        key: "年龄",
                        order: 2,
                        _id: "54f3d8c6f0d58e0557e6f52e",
                        type: "input",
                    }
                ]
            }
            , {
                key: "分组",
                edit:true,
                order: 3,
                _id: "54f3d8c6f0d58e0557e6f52d",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "第一组",
                        "第二组",
                        "第四组",
                        "第三组"
                    ]
                },
                type: "select",
            }, {
                key: "是否为会员",
                edit:true,
                mustFill: false,
                order: 4,
                _id: "54f3d8c6f0d58e0557e6f52c",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "是",
                        "否"
                    ]
                },
                type: "boolean",
            }, {
                key: "付款方式",
                edit:true,
                order: 5,
                _id: "54f3d8c6f0d58e0557e6f52b",
                selectOption: {
                    allowMulti: true,
                    choices: [
                        "支付宝",
                        "财付通"
                    ]
                },
                type: "select",
            }, {
                key: "备注",
                edit:true,
                order: 6,
                _id: "54f3d8c6f0d58e0557e6f52a",
                type: "textarea",
            }
        ],
        records: [{
            '_id':'99-099323',
            'user':{
                avatar:'img/avatar1.svg',
                username:'eisneim',
            },
            '手机号':'12312',
            '年龄':'12321',
            '分组':'Ohent',
            '是否为会员':'Ohent',
            '付款方式':'eisneim',
            '备注':'eisneim',
            '姓名':'eisneim hahh',
        },{
            '_id':'99-099323',
            'user':{
                avatar:'img/avatar2.svg',
                username:'Julia',
            },
            '手机号':'terry',
            '年龄':'terry',
            '分组':'terry',
            '是否为会员':'terry',
            '付款方式':'terry',
            '备注':'terry',
            '姓名':'eisneim hahh',
        },
        {
            '_id':'99-eee',
            'user':{
                avatar:'img/avatar1.svg',
                username:'eisneim',
            },
            '手机号':'joan',
            '年龄':'joan',
            '分组':'joan',
            '是否为会员':'joan',
            '付款方式':'joan',
            '备注':'joan',
            '姓名':'eisneim hahh',
        },
        {
            '_id':'99-222',
            'user':{
                avatar:'img/avatar2.svg',
                username:'Julia',
            },
            '手机号':'juia',
            '年龄':'juia',
            '分组':'juia',
            '是否为会员':'juia',
            '付款方式':'juia',
            '备注':'juia',
            '姓名':'eisneim hahh',
        },
        {
            '_id':'99-ddd',
            'user':{
                avatar:'img/avatar1.svg',
                username:'eisneim',
            },
            '手机号':'eisneim',
            '年龄':'eisneim',
            '分组':'eisneim',
            '是否为会员':'oop',
            '付款方式':'oop',
            '备注':'oop',
            '姓名':'eisneim hahh',
        },

        {
            '_id':'99-099323',
            'user':{
                avatar:'img/avatar2.svg',
                username:'Julia',
            },
            '手机号':'Ohent',
            '年龄':'jane',
            '分组':'jane',
            '是否为会员':'jane',
            '付款方式':'jane',
            '备注':'Ohent',
            '姓名':'eisneim hahh',
        }          
        ],
    },
    raw:{
        def: [
            {
                key: "姓名",
                order: 0,
                _id: "54f3d8c6f0d58e0557e6f530",
                tplName: "input",
            }, {
                key: "手机号",
                order: 1,
                _id: "54f3d8c6f0d58e0557e6f52f",
                tplName: "input",
            }, {
                key: "年龄",
                order: 2,
                _id: "54f3d8c6f0d58e0557e6f52e",
                tplName: "input",
            }, {
                key: "分组",
                order: 3,
                _id: "54f3d8c6f0d58e0557e6f52d",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "选项名",
                        "asdfad",
                        "asdfd",
                        "财付通"
                    ]
                },
                tplName: "select",
            }, {
                key: "是否为会员",
                mustFill: false,
                order: 4,
                _id: "54f3d8c6f0d58e0557e6f52c",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "是",
                        "否"
                    ]
                },
                tplName: "boolean",
            }, {
                key: "付款方式",
                order: 5,
                _id: "54f3d8c6f0d58e0557e6f52b",
                selectOption: {
                    allowMulti: true,
                    choices: [
                        "选项名",
                        "财付通"
                    ]
                },
                tplName: "select",
            }, {
                key: "备注",
                order: 6,
                _id: "54f3d8c6f0d58e0557e6f52a",
                tplName: "textarea",
            }
        ],

    }
});