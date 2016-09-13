angular.module('settingsPage', [
    'ngRoute'
])



    .config(function($routeProvider) {
        $routeProvider.when('/me/settings', {
            templateUrl: 'settings-page/settings-page.tpl.html',
            controller: 'settingsPageCtrl',
            resolve: {
                isAuth: function($q, CurrentUser){
                    return CurrentUser.isLoggedIn(true)
                }
            }
        })
    })



    .controller("settingsPageCtrl", function($scope,
                                             $rootScope,
                                             $auth,
                                             $route,
                                             $location,
                                             $http,
                                             Person,
                                             CurrentUser){

        console.log("the settings page loaded")
        var myOrcidId = CurrentUser.d.orcid_id
        $scope.orcidId = myOrcidId
        $scope.givenNames = CurrentUser.d.given_names


        $scope.wantToDelete = false
        $scope.deleteProfile = function() {
            $http.delete("/api/me")
                .success(function(resp){
                    // let Intercom know
                    window.Intercom("update", {
                        user_id: myOrcidId,
                        is_deleted: true
                    })

                    CurrentUser.logout()
                    $location.path("/")
                    alert("Your profile has been deleted.")
                })
                .error(function(){
                    alert("Sorry, something went wrong!")
                })
        }


        $scope.syncState = 'ready'

        $scope.pullFromOrcid = function(){
            console.log("ah, refreshing!")
            $scope.syncState = "working"
            $http.post("/api/person/" + myOrcidId)
                .success(function(resp){
                    // force a reload of the person
                    Intercom('trackEvent', 'synced-to-edit');
                    $rootScope.sendToIntercom(resp)
                    Person.load(myOrcidId, true).then(
                        function(resp){
                            $scope.syncState = "success"
                            console.log("we reloaded the Person after sync")
                        }
                    )
                })
        }

    })












