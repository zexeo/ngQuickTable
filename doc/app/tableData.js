angular.module('ngQuickTable-doc').constant('TABLEDATA', { 
    parsed: {
        def: [
            {
                key:'user',
                order: 0,
                type: "custom",
                tpl: '<h2>tpl pls</h2>',
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
                        key: "asdfasdf",
                        order: 2,
                        _id: "54f3d8c6f0d58e0557e6f52e",
                        type: "input",
                    }
                ]
            }
            , {
                key: "字段名称",
                order: 3,
                _id: "54f3d8c6f0d58e0557e6f52d",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "选项名",
                        "asdfad",
                        "asdfd",
                        "asdfasd"
                    ]
                },
                type: "select",
                isPreset: false,
            }, {
                key: "fuk",
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
                isPreset: false,
            }, {
                key: "123323",
                order: 5,
                _id: "54f3d8c6f0d58e0557e6f52b",
                selectOption: {
                    allowMulti: true,
                    choices: [
                        "选项名",
                        "asdfasd"
                    ]
                },
                type: "select",
                isPreset: false,
            }, {
                key: "121312",
                order: 6,
                _id: "54f3d8c6f0d58e0557e6f52a",
                type: "textarea",
                isPreset: false,
            }
        ],
        records: [
            [
                {
                    key:'_id',
                    value:'99-099323',
                },
                {
                    key: '姓名',
                    value:'eisneim',
                },
                {
                    key: '手机号',
                    value:'eisneim',
                },
                {
                    key: 'asdfasdf',
                    value:'eisneim',
                },
                {
                    key: '字段名称',
                    value:'eisneim',
                },
                {
                    key: 'fuk',
                    value:'eisneim',
                },
                {
                    key: '123323',
                    value:'eisneim',
                },
                {
                    key: '121312',
                    value:'eisneim',
                }
            ],
            [
                {
                    key:'_id',
                    value:'99-099323',
                },
                {
                    key: '姓名',
                    value:'terry',
                },
                {
                    key: '手机号',
                    value:'terry',
                },
                {
                    key: 'asdfasdf',
                    value:'terry',
                },
                {
                    key: '字段名称',
                    value:'terry',
                },
                {
                    key: 'fuk',
                    value:'terry',
                },
                {
                    key: '123323',
                    value:'terry',
                },
                {
                    key: '121312',
                    value:'terry',
                }
            ],
                
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
                key: "asdfasdf",
                order: 2,
                _id: "54f3d8c6f0d58e0557e6f52e",
                tplName: "input",
                isPreset: false,
            }, {
                key: "字段名称",
                order: 3,
                _id: "54f3d8c6f0d58e0557e6f52d",
                selectOption: {
                    allowMulti: false,
                    choices: [
                        "选项名",
                        "asdfad",
                        "asdfd",
                        "asdfasd"
                    ]
                },
                tplName: "select",
                isPreset: false,
            }, {
                key: "fuk",
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
                isPreset: false,
            }, {
                key: "123323",
                order: 5,
                _id: "54f3d8c6f0d58e0557e6f52b",
                selectOption: {
                    allowMulti: true,
                    choices: [
                        "选项名",
                        "asdfasd"
                    ]
                },
                tplName: "select",
                isPreset: false,
            }, {
                key: "121312",
                order: 6,
                _id: "54f3d8c6f0d58e0557e6f52a",
                tplName: "textarea",
                isPreset: false,
            }
        ],

    }
});