
const HOST_URL = "https://calcinsulin.herokuapp.com"

var app = new Vue({
    el: '#app',
    data: {
        SignUpBool: false,
        SignInBool: false,
        healthForm: false,
        showNavButtons: true,
        changeProfile: false,
        correctLogin: false,
        usersProfile: {},
        isUserLoggedIn: false,
        mealBool: false,
        bsBool: false,
        infoBool: false,
        editPageBool: false,
        sessionBool: false,
        ShowTotalBool: false,

        firstName: "",
        lastName: "",
        email: "",
        password: "",
        targetBS: "",
        InsulinCR: "",
        CarbF: "",
        doseUnit: "",
        totalCarbs: "",

        CurrentBloodSugar: "",
        SearchQuery: "",
        SearchResults: [],
        mealFood:[],
        errors:{},
        totalInsulin: "",

    },
    methods: {
        validProfile: function(){
            this.errors = {};
            if(this.firstName.length == 0){
                this.errors.firstName = "please include your first name";
            }
            if(this.lastName.length == 0){
                this.errors.lastName = "please include your last name";
            }
            if(this.email.length == 0){
                this.errors.email = "please include your email";
            }
            if(this.password.length == 0){
                this.errors.password = "please include your password"
            }
            if(this.targetBS.length == 0){
                this.errors.targetBS = "please include your target blood sugar";
            }
            if(this.InsulinCR.length == 0){
                this.errors.InsulinCR = "please include your insulin to carb ratio";
            }
            if(this.CarbF.length == 0){
                this.errors.CarbF = "please include your carb factor, (second number in carb ratio";
            }
            if(this.doseUnit.length == 0){
                this.errors.doseUnit = "please include your unit dose measurment"
            }
            else {
                return this.newProfileIsValid;
            }
        },
        mealCorrectionCalc: function(){
            this.totalInsulin = Math.round(((parseInt(this.CurrentBloodSugar, 10) - parseInt(this.usersProfile.targetBS, 10)) / parseInt(this.usersProfile.CarbF, 10)));
            console.log("bloodsugar correction " + this.totalInsulin);
            this.totalInsulin += Math.round(parseFloat(this.totalCarbs, 10) / parseInt(this.usersProfile.CarbF, 10));
            console.log("meal correction " + this.totalInsulin);
            this.ShowTotalBool = true;
        },
        bsCorrection: function(){
            this.totalInsulin = Math.round((parseInt(this.CurrentBloodSugar, 10) - parseInt(this.usersProfile.targetBS, 10)) / parseInt(this.usersProfile.CarbF, 10));
            this.ShowTotalBool = true;
        },

        EditProfilePage: function(){
            this.editPageBool = true
            this.SignUpBool = false;
            this.SignInBool = false;
            this.mealBool = false;
            this.bsBool = false;
            this.infoBool = false;

            this.firstName = this.usersProfile.firstName;
            this.lastName = this.usersProfile.lastName;
            this.email = this.usersProfile.email;
            this.password = this.usersProfile.password;
            this.targetBS = this.usersProfile.targetBS;
            this.doseUnit = this.usersProfile.doseUnit;
            this.CarbF = this.usersProfile.CarbF;
            this.InsulinCR = this.usersProfile.InsulinCR;
        },
        infoButton: function(){
            this.SignUpBool = false;
            this.SignInBool = false;
            this.mealBool = false;
            this.bsBool = false;
            this.infoBool = true;
        },
        homeButton:function(){
            this.SignUpBool = false;
            this.SignInBool = false;
            this.mealBool = false;
            this.bsBool = false;
            this.infoBool = false;
        },
        bsButton: function(){
            this.SignUpBool = false;
            this.SignInBool = false;
            this.mealBool = false;
            this.bsBool = true;

        },
        mealButton: function(){
            this.SignUpBool = false;
            this.SignInBool = false;
            this.bsBool = false;
            this.mealBool = true;
        },
        SignUpButton: function(){
            this.SignUpBool = true;
            this.SignInBool = false;
        },
        SignInButton: function(){
            this.SignInBool = true;
            this.SignUpBool = false;
        },
        close: function(){
            this.SignInBool = false;
            this.SignUpBool = false;
            this.healthForm = false;
            this.editPageBool =false;
        },
        SignUpNext: function(){
            this.healthForm = true;
            console.log("name: ", this.lastName);
        },
        checkSession: function(){
            return fetch(HOST_URL + "/session").then((response) => {
                response.json().then((data) => {
                    this.usersProfile = data;
                    this.sessionBool = true;
                    this.SignInBool = false;
                    this.SignUpBool = false;
                });
            });
        },
        endSession: function(){
            fetch(HOST_URL + "/session", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: "include"
            }).then((response)=>{
                this.sessionBool = false;
            });
        },
        searchButton: function(){
            // mSfiCjQ1UM7JqN76bffQtJFPT7tDP7RIkxwVazKS
            fetch(
                `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=mSfiCjQ1UM7JqN76bffQtJFPT7tDP7RIkxwVazKS&query=${this.SearchQuery}&dataType=Survey%20%28FNDDS%29&pageSize=7&pageNumber=1`
            ).then((response) => {
                response.json().then((data)=> {
                    this.SearchQuery = "";
                    this.SearchResults = [];
                    data.foods.forEach((foodItem)=> {
                        var SearchResults = {};
                        SearchResults.name = foodItem.description;
                        foodItem.foodNutrients.forEach(function (nutrient) {
                            if (nutrient.nutrientName == "Carbohydrate, by difference") {
                                SearchResults.carbs = nutrient.value;
                            }
                        });
                        this.SearchResults.push(SearchResults);
                    });
                });
            });
        },
        addFood: function(food){
            this.SearchResults = [];
            
            this.mealFood.push(food);

            this.TotalCarbs();
        },
        TotalCarbs: function(){
            console.log("in total carbs funcrion");
            if(this.mealFood.length > 0){
                var c = 0;
            this.mealFood.forEach((item)=> {
                c += item.carbs;
            });
            this.totalCarbs = Math.round(c * 100) / 100;
            console.log("total carbs ", c);
            }
        },
        createProfile: function(){
            if(!this.validProfile()){
                return;
            }

            console.log("name: ", this.lastName);
            console.log("bs: ", this.targetBS);

            var data = "firstName=" + encodeURIComponent(this.firstName);
            data += "&lastName=" + encodeURIComponent(this.lastName);
            data += "&email=" + encodeURIComponent(this.email);
            data += "&password=" + encodeURIComponent(this.password);
            data += "&targetBS=" + encodeURIComponent(this.targetBS);
            data += "&InsulinCR=" + encodeURIComponent(this.InsulinCR);
            data += "&CarbF=" + encodeURIComponent(this.CarbF);
            data += "&doseUnit=" + encodeURIComponent(this.doseUnit);

            console.log(data);

            fetch(HOST_URL + "/users", {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: "include"
            }).then((response) => {
                if(response.status == 422){
                    this.errors={};
                    this.errors.email = "email is already taken";
                    
                }
                else{
                    this.postSession();
                    this.showNavButtons = false;
                    this.SignInBool = false;
                    this.SignUpBool = false;
                    this.healthForm = false;
                    this.isUserLoggedIn = true;
                }
            });
            
        },
        postSession: function(){
            var data = "email=" + encodeURIComponent(this.email);
            data += "&plainPassword=" + encodeURIComponent(this.password);

            fetch(HOST_URL + "/session", {
                method: 'POST',
                body: data,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': '*'
                }
            }).then((response) => {
                if(response.status == 201){
                    this.checkSession().then((user)=>{
                        this.usersProfile = user;
                        this.password = "";
                        this.email = "";
                        this.SignInBool = false;
                        this.SignUpBool = false;
                        
                    })
                } else {
                    this.errorBool = true;
                    console.log("save failed");
                }
            });
        },
        EditProfile: function(){
            console.log("edit profile clicked");

            var data = "firstName=" + encodeURIComponent(this.firstName);
            data += "&lastName=" + encodeURIComponent(this.lastName);
            data += "&email=" + encodeURIComponent(this.email);
            data += "&password=" + encodeURIComponent(this.password);
            data += "&targetBS=" + encodeURIComponent(this.targetBS);
            data += "&InsulinCR=" + encodeURIComponent(this.InsulinCR);
            data += "&CarbF=" + encodeURIComponent(this.CarbF);
            data += "&doseUnit=" + encodeURIComponent(this.doseUnit);

            fetch(HOST_URL + "/users/"+ this.usersProfile._id, {
                method:'PUT',
                body: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response)=> {
                this.editPageBool = false;
                
            });
        },
        // fetchProfileAgain: function(){
        //     fetch("http:localhost:1234/users/"+ this.usersProfile._id).then((response)=>{
        //         //assign

        //         response.json().then((data)=>{
        //             console.log("data: ",data);
        //             this.usersProfile = data;
        //         });
                
        //     });
        // },
        AuthenticateUser: function(){

            fetch(HOST_URL + "/users").then((response) => {
                response.json().then((data) => {
                    console.log("this is the data ",data);
                    //this.allUsers = data;
                    for (user in data){
                        console.log("each user: ", user)
                        console.log("does ", data[user].email, "the same as ",this.email);
                        if (data[user].email == this.email){
                            if(data[user].password == this.password){
                                //correct login
                                this.correctLogin = true;
                                this.usersProfile = data[user];
                                console.log("this is the users profile: ", this.usersProfile);
                                this.firstName = data[user].firstName;
                                this.showNavButtons = false;
                                this.SignInBool = false;
                                this.SignUpBool = false;
                                this.healthForm = false;
                                this.isUserLoggedIn = true;
                            } else {
                                //incorrect password
                                console.log("incorrect password");
                            }
                        } else {
                            //incorrect email
                            console.log("incorrect email");
                        }
                    }

                })
            })
            // console.log("trying to authenticate user");
            // console.log("email: ", this.email);
            // fetch("http:localhost:1234/users/" + this.email).then((response) => {
            //     response.json().then((data) => {
            //         console.log(data);
            //         if(data.password == this.password){
            //             this.correctLogin = true;
            //             this.usersProfile = data;
            //             console.log("correct login");
            //             this.showNavButtons = false;
            //             this.SignInBool = false;
            //             this.SignUpBool = false;
            //             this.healthForm = false;
            //         }
            //         else {
            //             console.log("incorrect login");
            //         }

            //     });
            // });
        }

    },
    computed: {
        FnameIsInvalid: function(){
            return !!this.errors.firstName;
        },
        LnameIsInvalid: function(){
            return !!this.errors.lastName;
        },
        emailIsInvalid: function(){
            return !!this.errors.email;
        },
        passwordIsInvalid: function(){
            return !!this.errors.password;
        },
        targetBSIsInvalid: function(){
            return !!this.errors.targetBS;
        },
        insulinCRIsInvalid: function(){
            return !!this.errors.InsulinCR;
        },
        CarbFIsInvalid: function(){
            return !!this.errors.CarbF;
        },
        doseUnitIsInvalid: function(){
            return !!this.errors.doseUnit;
        },
        newProfileIsValid: function(){
            return Object.keys(this.errors).length == 0;
        }

    },
    created: function(){
        this.checkSession();
    }
})
