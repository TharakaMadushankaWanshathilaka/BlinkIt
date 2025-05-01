export const DisplayPriceInRupees = (price)=>{
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'LKR' // LKR stands for Sri Lankan Rupee
    }).format(price);
}
