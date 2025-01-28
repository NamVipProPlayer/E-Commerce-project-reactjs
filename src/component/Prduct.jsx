function Product({ title, url, price }) {
    console.log(title,url,price)
  return <div>
    <img src={url} style={{width: '183px', height: '183px'}}></img>
    <div>{title}</div>
    <div>Price: {price}</div>
  </div>;
}

export default Product;
/*
 const _listProduct = [
    {
      url: "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1hxwjyvn87n96.webp",
      title: "Iphone",
      price: "100$",
    },
    {
      url: "https://down-vn.img.susercontent.com/file/sg-11134301-7rd5q-lwcu5lhllkco56.webp",
      title: "Phone Holder",
      price: "10$",
    },
    {
      url: "https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m1i4fokiyl6n2d.webp",
      title: "Qick Charge",
      price: "30$",
    },
  ];
   <div style={{display: "flex", gap: "200px"}}>
      {_listProduct.map((product, index) => {
        return (
          <Product
            title={product.title}
            url={product.url}
            price={product.price}
            key={index}
          />
        );
      })}
    </div>
*/