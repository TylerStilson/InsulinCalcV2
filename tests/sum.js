function BSsum(BS, TargetBS, carbF){
    return Math.round((BS - TargetBS) / carbF);
}

function MealSum(BS, TargetBS, carbF, Tcarbs){
    x = Math.round((BS - TargetBS) / carbF);
    x += Math.round(Tcarbs/carbF);
    return x;
}

module.exports = BSsum;



