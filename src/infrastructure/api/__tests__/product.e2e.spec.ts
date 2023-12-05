import request from "supertest";
import { app, sequelize } from "../express";

describe("E2E test for product", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const response = await request(app).post("/product").send({
      name: "John",
      price: 100,
      type: "a",
    });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("John");
    expect(response.body.price).toBe(100);
  });

  it("should not create a product", async () => {
    const response = await request(app).post("/product").send({
      name: "John",
    });
    expect(response.status).toBe(500);
  });

  it("should list all product", async () => {
    const response = await request(app).post("/product").send({
      name: "John",
      price: 100,
      type: "a",
    });
    expect(response.status).toBe(200);
    const response2 = await request(app).post("/product").send({
      name: "Jane",
      price: 200,
      type: "b",
    });
    expect(response2.status).toBe(200);

    const listResponse = await request(app).get("/product").send();

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.products.length).toBe(2);
    const product = listResponse.body.products[0];
    expect(product.name).toBe("John");
    expect(product.price).toBe(100);
    const product2 = listResponse.body.products[1];
    expect(product2.name).toBe("Jane");
    expect(product2.price).toBe(400);

    const listResponseXML = await request(app)
      .get("/product")
      .set("Accept", "application/xml")
      .send();

    expect(listResponseXML.status).toBe(200);
    expect(listResponseXML.text).toContain(
      `<?xml version="1.0" encoding="UTF-8"?>`
    );
    expect(listResponseXML.text).toContain(`<products>`);
    expect(listResponseXML.text).toContain(`<product>`);
    expect(listResponseXML.text).toContain(`<name>John</name>`);
    expect(listResponseXML.text).toContain(`<price>100</price>`);
    expect(listResponseXML.text).toContain(`</product>`);
    expect(listResponseXML.text).toContain(`<product>`);
    expect(listResponseXML.text).toContain(`<name>Jane</name>`);
    expect(listResponseXML.text).toContain(`<price>400</price>`);
    expect(listResponseXML.text).toContain(`</product>`);
    expect(listResponseXML.text).toContain(`</products>`);
  });
});
