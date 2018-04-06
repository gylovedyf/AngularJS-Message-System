if(localStorage.getItem('loginStatus') == null) {
    localStorage.setItem('loginStatus','false');
}

var app = angular.module("myapp", ["ngRoute"]);
app.config(function ($routeProvider) {
    $routeProvider.when("/", {
            templateUrl: "views/login.html",
            controller: 'loginCtrl'
        })
        .when("/signup", {
            templateUrl: "views/signup.html",
            controller: 'signupCtrl'
        })
        .when("/home", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (localStorage.getItem('loginStatus') == 'false') {
                        $location.path('/');
                    }
                }
            },
            templateUrl: 'views/home.html',
            controller: 'homeCtrl'
        })
        .when("/profile", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (localStorage.getItem('loginStatus') == 'false') {
                        $location.path('/');
                    }
                }
            },
            templateUrl: 'views/profile.html',
            controller: 'profileCtrl'
        })
        .when("/messages", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (localStorage.getItem('loginStatus') == 'false') {
                        $location.path('/');
                    }
                }
            },
            templateUrl: 'views/messages.html',
            controller: 'messagesCtrl'
        })
        .when("/edit", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (localStorage.getItem('loginStatus') == 'false') {
                        $location.path('/');
                    }
                }
            },
            templateUrl: 'views/edit.html',
            controller: 'editCtrl'
        })
        .when("/messages/:uid", {
            resolve: {
                "check": function ($location, $rootScope) {
                    if (localStorage.getItem('loginStatus') == 'false') {
                        $location.path('/');
                    }
                }
            },
            templateUrl: 'views/messageDetail.html',
            controller: 'messageDetailCtrl'
        })

        .otherwise({
            redirectTo: "/"
        });
});

app.controller('loginCtrl', ['$scope', '$location', '$rootScope', 'verifyService', function ($scope, $location, $rootScope, verifyService) {
    $scope.submit = function () {
        var login = verifyService.verify($scope.username, $scope.password);
        if (login.result == true) {
            localStorage.setItem('loginStatus', 'true');
            $rootScope.index = login.index;
            $location.path('/home');
            $rootScope.p = JSON.parse(localStorage.getItem('users'))[$rootScope.index];
        }
    }
}]);

app.controller('signupCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.createUser = function () {
        var p = new Object();
        p.username = $scope.username;
        p.password = $scope.password;
        p.firstname = $scope.firstname;
        p.lastname = $scope.lastname;
        p.email = $scope.email;
        p.phone = $scope.phone;
        p.loaction = $scope.location;
        if (localStorage.getItem('users') == null) {
            localStorage.setItem('users', '[]');
        }
        var users = JSON.parse(localStorage.getItem('users'));
        users.push(p);
        localStorage.setItem('users', JSON.stringify(users));
        alert('User Created Successfully!!');
        $location.path('/');
    }
}]);

app.controller('homeCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
    $scope.logout = function () {
        localStorage.setItem('loginStatus', 'false');
        $location.path('/');
    }
}]);

app.controller('profileCtrl', ['$scope', '$rootScope', '$route', function ($scope, $rootScope, $route) {
    var user = $rootScope.p;
    delete user['messages'];
    $scope.user = user;

    $rootScope.$on('update', function () {
        $route.reload();
    });
}]);

app.controller('editCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.update = function () {
        var obj = new Object();
        obj.username = $scope.username;
        obj.password = $scope.password;
        obj.firstname = $scope.firstname;
        obj.lastname = $scope.lastname;
        obj.email = $scope.email;
        obj.phone = $scope.phone;
        obj.loaction = $scope.location;
        for (var prop in obj) {
            if (obj[prop] != undefined) {
                $rootScope.p[prop] = obj[prop];
            }
        }

        var users = JSON.parse(localStorage.getItem('users'));
        users.splice($rootScope.index, 1, $rootScope.p);
        localStorage.setItem('users', JSON.stringify(users));
        $rootScope.$emit('update');
    }

}]);

app.controller('messagesCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
    var users = JSON.parse(localStorage.getItem('users'));
    $scope.messages = users[$rootScope.index].messages;
    $scope.recipients = [];
    for (var i = 0; i < users.length; i++) {
        $scope.recipients.push(users[i].username);
    }
    $scope.send = function () {
        var msg = new Object();
        var sel = document.getElementById("sel");
        var recipientIndex = sel.selectedIndex;
        var rec = sel.options[recipientIndex].text;
        msg.recipient = rec;
        msg.recipient_img = '';
        msg.sender = $rootScope.p.username;
        msg.sender_img = '';
        msg.title = $scope.title;
        msg.description = $scope.discription;
        msg.created_at = Date();
        msg.important = '0';

        var recipient = JSON.parse(localStorage.getItem('users'))[recipientIndex];

        if (recipient.messages == undefined) {
            recipient.messages = [];
            recipient.messages.push(msg);
        } else {
            recipient.messages.push(msg);
        }
        users.splice(recipientIndex, 1, recipient);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Message Send!!');

    };
}]);

app.controller('messageDetailCtrl', ['$scope', '$rootScope', '$routeParams', 'sendEmail', '$location', function ($scope, $rootScope, $routeParams, sendEmail, $location) {
    var users = JSON.parse(localStorage.getItem('users'));
    var user = users[$rootScope.index];
    $scope.message = user.messages[$routeParams.uid];
    $scope.reply = function () {
        var reply = 'RE: ' + $scope.replytext + '\n' + $scope.message.description;
        var msg = new Object();
        msg.recipient = $scope.message.sender;
        msg.recipient_img = '';
        msg.sender = $scope.message.recipient;
        msg.sender_img = '';
        msg.title = 'Re:' + $scope.message.title;
        msg.description = reply;
        msg.created_at = Date();
        msg.important = '0';
        sendEmail.send(msg.recipient, msg);
        alert('Send Reply!');
    }
    $scope.delete = function () {
        user.messages.splice($routeParams.uid, 1);
        localStorage.setItem('users', JSON.stringify(users));
        alert('Message Deleted!!');
        $location.path('/messages')
    };
}]);
app.factory('sendEmail', function () {
    return {
        send: function (recipient, msg) {
            var users = JSON.parse(localStorage.getItem('users'));
            var recipientIndex;

            for (var i = 0; i < users.length; i++) {
                if (recipient == users[i].username) {
                    if (users[i].messages == undefined) {
                        users[i].messages = [];
                        users[i].messages.push(msg);
                    } else {
                        users[i].messages.push(msg);
                    }
                    break;
                }
            }

            localStorage.setItem('users', JSON.stringify(users));

        }
    }
});


app.directive('myImportant', function ($rootScope) {
    return {
        template: '<span class="glyphicon glyphicon-star" ng-if="isImportant" ng-click="changeMark()"></span><span class="glyphicon glyphicon-star-empty" ng-if="!isImportant" ng-click="changeMark()"></span>',
        
        link: function (scope, elem, attrs) {
            var users = JSON.parse(localStorage.getItem('users'));
            var message = users[$rootScope.index];
            scope.isImportant = (message.important === '1');
            
            scope.changeMark = function() {
                if(message.important == '1') {
                    message.important = '0';
                    scope.isImportant = false;
                    
                } else {
                    message.important = '1';
                    scope.isImportant = true;
                    
                }
                localStorage.setItem('users',JSON.stringify(users));
            }
            
        }
    }
});

app.factory('verifyService', function () {
    var obj = {};
    obj.verify = function (name, pwd) {
        var res = new Object();
        var users = JSON.parse(localStorage.getItem('users'));
        for (var i = 0; i < users.length; i++) {
            if (name == users[i].username && pwd == users[i].password) {
                res.result = true;
                res.index = i;
                break;
            }
        }
        return res;
    };
    return obj;
});
