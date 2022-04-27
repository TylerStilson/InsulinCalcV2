function MealSum(BS, TargetBS, carbF, Tcarbs){
    x = Math.round((BS - TargetBS) / carbF);
    x += Math.round(Tcarbs/carbF);
    return x;
}

module.exports = MealSum;
