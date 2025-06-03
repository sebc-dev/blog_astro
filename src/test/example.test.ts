import { describe, it, expect } from "vitest";

describe("Exemple de test unitaire", () => {
  it("devrait additionner deux nombres correctement", () => {
    expect(1 + 1).toBe(2);
  });

  it("devrait vérifier qu'une chaîne contient un texte", () => {
    const message = "Hello, Vitest!";
    expect(message).toContain("Vitest");
  });

  it("devrait vérifier qu'un tableau contient un élément", () => {
    const fruits = ["pomme", "banane", "orange"];
    expect(fruits).toContain("banane");
  });
});
