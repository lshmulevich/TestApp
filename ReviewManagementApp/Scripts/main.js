   
var app = angular.module('myApp', ['ngGrid']);

app.service('dataStoreService', function ($window) {
    this.localStorageKey = 'AngularReviews';

    //save into local storage
    this.store = function(data) {
        $window.localStorage.setItem(this.localStorageKey, JSON.stringify(data));
    };
    //get from local storage
    this.get = function() {
         return  $window.localStorage.getItem(this.localStorageKey);
    };
});

app.controller('MyCtrl', function($scope, $http, $filter, $window, dataStoreService) {
    $scope.viewReviews = true;//when false the edit form is shown
    $scope.newReview = {};//data of a new review to be added
    $scope.gridData = [];//array of all reviews
    $scope.totalServerItems = 0;//number of reviews

    $scope.pagingOptions = {
        pageSizes: [10, 20, 100],
        pageSize: 10,
        currentPage: 1
    };

    $scope.sortingOptions = {
        sortColumn: "ReviewName",
        sortDirection: "asc"
    };

    $scope.gridOptions = {
        data: 'currentPageData',
        enablePaging: true,
        enableSorting: true,
        useExternalSorting: true,
        sortInfo: { fields: [], columns: [], directions: [] },
        showFooter: true,
        columnDefs: [{ field: 'ReviewName', displayName: 'Review Name' }, { field: 'Score', displayName: 'Review Score' }],
        totalServerItems: 'totalServerItems',
        pagingOptions: $scope.pagingOptions
    };

    //adds new review to the local storage
    $scope.save=function() {
        if ($scope.newReview.Score != undefined && $scope.newReview.ReviewName != undefined) {
            $scope.gridData.push($scope.newReview);
            //save to local storage
            dataStoreService.store($scope.gridData);
            $scope.getPagedDataAsync();
            $scope.viewReviews = true;
        } 
    }
    

    //order reviews by sortColumn
    $scope.sortData = function (data, sortColumn, sortDirection) {
        data = $filter('orderBy')(data, sortColumn, sortDirection == "desc");
        return data;
    }

    //$scope.currentPageData is set to reviews of the current page
    $scope.setPagingData = function (data, page, pageSize, sortColumn, sortDirection) {
        data = $scope.sortData(data, sortColumn, sortDirection);
        var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
        $scope.currentPageData = pagedData;
        $scope.totalServerItems = data.length;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    };

    $scope.getPagedDataAsync = function() {
        setTimeout(function () {
            var sGridData = dataStoreService.get();
            if (sGridData != undefined) {
                $scope.gridData = $.parseJSON(sGridData);
                $scope.setPagingData($scope.gridData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize, $scope.sortingOptions.sortColumn, $scope.sortingOptions.sortDirection);
            }
        }, 100);
    };


    //handles pagination
    $scope.$watch('pagingOptions', function(newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync();
        }
    }, true);

    //handles sorting
    $scope.$watch('gridOptions.ngGrid.config.sortInfo', function (newValue, oldValue) {
        $scope.sortingOptions.sortDirection = newValue.directions.length > 0 ? newValue.directions[0] : "asc";
        $scope.sortingOptions.sortColumn = newValue.fields.length > 0 ? newValue.fields[0] : "ReviewName";
        
        $scope.getPagedDataAsync();
    }, true);

    $scope.getPagedDataAsync();
});