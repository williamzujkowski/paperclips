/**
 * Tests for Events System
 */

import EventsSystem from "../../src/game/ui/events.js";
import { GameState } from "../../src/game/core/gameState.js";
import ProductionSystem from "../../src/game/systems/production.js";
import MarketSystem from "../../src/game/systems/market.js";
import ComputingSystem from "../../src/game/systems/computing.js";
import CombatSystem from "../../src/game/systems/combat.js";
import ProjectsSystem from "../../src/game/systems/projects.js";

// Mock DOM elements
const mockElement = (id, action, value = "") => ({
  id,
  dataset: { action, projectId: "testProject" },
  value,
  preventDefault: jest.fn(),
});

// Mock event
const mockEvent = (type = "click", shiftKey = false) => ({
  type,
  target: mockElement("testButton", "testAction"),
  preventDefault: jest.fn(),
  shiftKey,
  ctrlKey: false,
  altKey: false,
  key: "",
});

// Mock file and FileReader
const mockFile = new Blob(['{"resources":{"clips":100}}'], {
  type: "application/json",
});

describe("EventsSystem", () => {
  let gameState;
  let eventsSystem;
  let systems;
  let originalDocument;
  let originalWindow;
  let originalConfirm;
  let addEventListenerSpy;
  let removeEventListenerSpy;
  let getElementByIdSpy;
  let createElementSpy;
  let confirmSpy;

  beforeEach(() => {
    // Save original globals
    originalDocument = global.document;
    originalWindow = global.window;
    originalConfirm = global.confirm;

    // Mock confirm before anything else
    confirmSpy = jest.fn().mockReturnValue(false);
    global.confirm = confirmSpy;

    // Mock window
    global.window = {
      confirm: confirmSpy,
    };

    // Create spies for document methods
    addEventListenerSpy = jest.fn();
    removeEventListenerSpy = jest.fn();
    getElementByIdSpy = jest.fn();
    createElementSpy = jest.fn(() => {
      const element = {
        id: "",
        className: "",
        textContent: "",
        style: { display: "" },
        href: "",
        download: "",
        type: "",
        accept: "",
        click: jest.fn(),
        onchange: null,
      };

      // Make properties writable
      Object.defineProperty(element, "id", { writable: true, value: "" });
      Object.defineProperty(element, "className", {
        writable: true,
        value: "",
      });
      Object.defineProperty(element, "textContent", {
        writable: true,
        value: "",
      });
      Object.defineProperty(element, "href", { writable: true, value: "" });
      Object.defineProperty(element, "download", { writable: true, value: "" });
      Object.defineProperty(element, "type", { writable: true, value: "" });
      Object.defineProperty(element, "accept", { writable: true, value: "" });
      Object.defineProperty(element, "onchange", {
        writable: true,
        value: null,
      });

      return element;
    });

    // Mock document
    global.document = {
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy,
      getElementById: getElementByIdSpy,
      createElement: createElementSpy,
      body: {
        appendChild: jest.fn(),
      },
    };

    // Make sure document methods are properly bound
    global.document.getElementById = getElementByIdSpy;
    global.document.createElement = createElementSpy;

    // Mock URL API
    global.URL = {
      createObjectURL: jest.fn().mockReturnValue("blob:mock-url"),
      revokeObjectURL: jest.fn(),
    };

    // Mock FileReader
    global.FileReader = jest.fn().mockImplementation(() => ({
      readAsText: jest.fn(function (_file) {
        // Simulate async file read
        setTimeout(() => {
          this.onload({ target: { result: '{"resources":{"clips":100}}' } });
        }, 0);
      }),
    }));

    // Initialize game state and systems
    gameState = new GameState();

    // Mock save/load methods
    gameState.save = jest.fn().mockReturnValue(true);
    gameState.load = jest.fn().mockReturnValue(true);
    gameState.reset = jest.fn();
    gameState.export = jest.fn().mockReturnValue('{"resources":{"clips":100}}');
    gameState.import = jest.fn().mockReturnValue(true);

    systems = {
      production: new ProductionSystem(gameState),
      market: new MarketSystem(gameState),
      computing: new ComputingSystem(gameState),
      combat: new CombatSystem(gameState),
      projects: new ProjectsSystem(gameState),
    };

    // Mock system methods that are called in tests
    systems.production.manualClip = jest.fn().mockReturnValue(5);
    systems.production.buyAutoClipper = jest.fn().mockReturnValue(true);
    systems.production.buyMegaClipper = jest.fn().mockReturnValue(true);

    systems.market.raisePrice = jest.fn();
    systems.market.lowerPrice = jest.fn().mockReturnValue(true);
    systems.market.buyMarketing = jest.fn().mockReturnValue(true);
    systems.market.buyWire = jest.fn().mockReturnValue(true);
    systems.market.toggleWireBuyer = jest.fn().mockReturnValue(true);

    systems.computing.buyProcessor = jest.fn().mockReturnValue(true);
    systems.computing.buyMemory = jest.fn().mockReturnValue(true);
    systems.computing.setCreativity = jest.fn();
    systems.computing.setThinkingAllocation = jest.fn();

    systems.combat.allocateProbeStats = jest.fn().mockReturnValue(true);
    systems.combat.enableCombat = jest.fn();
    systems.combat.disableCombat = jest.fn();

    systems.projects.completeProject = jest.fn().mockReturnValue(true);

    // Create events system
    eventsSystem = new EventsSystem(gameState, systems);

    // Mock showFeedback to prevent DOM appendChild issues in tests
    jest
      .spyOn(eventsSystem, "showFeedback")
      .mockImplementation((_message, _type) => {
        // Do nothing in tests to avoid DOM appendChild issues
        return;
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Restore original globals
    global.document = originalDocument;
    global.window = originalWindow;
    global.confirm = originalConfirm;
  });

  describe("Initialization", () => {
    test("should initialize with handlers and shortcuts", () => {
      expect(eventsSystem.handlers.size).toBeGreaterThan(0);
      expect(eventsSystem.shortcuts.size).toBeGreaterThan(0);
    });

    test("should set up event delegation", () => {
      // Create a new EventsSystem instance to test the setup
      const newAddEventListenerSpy = jest.fn();
      global.document.addEventListener = newAddEventListenerSpy;

      new EventsSystem(gameState, systems);

      expect(newAddEventListenerSpy).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(newAddEventListenerSpy).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
      expect(newAddEventListenerSpy).toHaveBeenCalledWith(
        "input",
        expect.any(Function),
      );
      expect(newAddEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );
    });

    test("should register all required handlers", () => {
      const expectedHandlers = [
        "makeClip",
        "buyAutoClipper1",
        "buyMegaClipper1",
        "raisePrice",
        "lowerPrice",
        "buyAds",
        "buyWire1000",
        "toggleWireBuyer",
        "buyProcessor1",
        "buyMemory1",
        "adjustThinking",
        "allocateProbeStats",
        "toggleCombat",
        "completeProject",
        "saveGame",
        "loadGame",
        "resetGame",
        "exportSave",
        "importSave",
      ];

      expectedHandlers.forEach((handler) => {
        expect(eventsSystem.handlers.has(handler)).toBe(true);
      });
    });

    test("should register keyboard shortcuts", () => {
      const expectedShortcuts = [
        " ",
        "1",
        "2",
        "3",
        "4",
        "arrowup",
        "arrowdown",
        "ctrl+s",
        "ctrl+l",
        "escape",
      ];

      expectedShortcuts.forEach((shortcut) => {
        expect(eventsSystem.shortcuts.has(shortcut)).toBe(true);
      });
    });
  });

  describe("Event Delegation", () => {
    test("should handle click events with valid action", () => {
      const event = mockEvent("click");
      event.target.dataset.action = "makeClip";

      eventsSystem.handleClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(systems.production.manualClip).toHaveBeenCalled();
    });

    test("should ignore clicks without action", () => {
      const event = mockEvent("click");
      delete event.target.dataset.action;

      eventsSystem.handleClick(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    test("should handle unknown actions gracefully", () => {
      const event = mockEvent("click");
      event.target.dataset.action = "unknownAction";

      eventsSystem.handleClick(event);

      expect(event.preventDefault).toHaveBeenCalled();
      // Should log warning but not throw
    });

    test("should handle change events", () => {
      const event = mockEvent("change");
      event.target.dataset.action = "adjustThinking";
      event.target.value = "75";

      eventsSystem.handleChange(event);

      expect(systems.computing.setThinkingAllocation).toHaveBeenCalledWith(75);
    });

    test("should handle input events", () => {
      const event = mockEvent("input");
      event.target.dataset.action = "adjustThinking";
      event.target.value = "50";

      eventsSystem.handleInput(event);

      expect(systems.computing.setThinkingAllocation).toHaveBeenCalledWith(50);
    });

    test("should handle errors in event handlers", () => {
      const event = mockEvent("click");
      event.target.dataset.action = "makeClip";

      // Force an error
      eventsSystem.systems.production = null;

      // Should not throw
      expect(() => eventsSystem.handleClick(event)).not.toThrow();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("should handle space bar for making clips", () => {
      const event = {
        key: " ",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      eventsSystem.handleKeyboard(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(systems.production.manualClip).toHaveBeenCalled();
    });

    test("should handle number shortcuts", () => {
      eventsSystem.handleKeyboard({
        key: "1",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      });

      expect(systems.production.buyAutoClipper).toHaveBeenCalled();
    });

    test("should handle arrow keys for price adjustment", () => {
      eventsSystem.handleKeyboard({
        key: "ArrowUp",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      });

      eventsSystem.handleKeyboard({
        key: "ArrowDown",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      });

      expect(systems.market.raisePrice).toHaveBeenCalled();
      expect(systems.market.lowerPrice).toHaveBeenCalled();
    });

    test("should handle Ctrl+S for save", () => {
      eventsSystem.handleKeyboard({
        key: "s",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      });

      expect(gameState.save).toHaveBeenCalled();
    });

    test("should handle escape for reset confirmation", () => {
      eventsSystem.handleKeyboard({
        key: "Escape",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      });

      expect(confirmSpy).toHaveBeenCalled();
    });

    test("should ignore unregistered shortcuts", () => {
      const event = {
        key: "x",
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      eventsSystem.handleKeyboard(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("Production Actions", () => {
    test("should make single clip without shift", () => {
      gameState.set("resources.wire", 10);

      eventsSystem.makeClip({ shiftKey: false });

      expect(systems.production.manualClip).toHaveBeenCalledWith(1);
    });

    test("should make 10 clips with shift", () => {
      gameState.set("resources.wire", 10);

      eventsSystem.makeClip({ shiftKey: true });

      expect(systems.production.manualClip).toHaveBeenCalledWith(10);
    });

    test("should buy auto clipper with feedback", () => {
      eventsSystem.buyAutoClipper();

      expect(systems.production.buyAutoClipper).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "AutoClipper purchased!",
        "success",
      );
    });

    test("should show error when cannot afford auto clipper", () => {
      systems.production.buyAutoClipper.mockReturnValue(false);

      eventsSystem.buyAutoClipper();

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Cannot afford AutoClipper",
        "error",
      );
    });

    test("should handle mega clipper purchase", () => {
      eventsSystem.buyMegaClipper();

      expect(systems.production.buyMegaClipper).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "MegaClipper purchased!",
        "success",
      );
    });
  });

  describe("Market Actions", () => {
    test("should raise price", () => {
      eventsSystem.raisePrice();

      expect(systems.market.raisePrice).toHaveBeenCalled();
    });

    test("should lower price with limit warning", () => {
      systems.market.lowerPrice.mockReturnValue(false);

      eventsSystem.lowerPrice();

      expect(systems.market.lowerPrice).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Price cannot go lower",
        "warning",
      );
    });

    test("should buy advertising", () => {
      eventsSystem.buyAds();

      expect(systems.market.buyMarketing).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Marketing purchased!",
        "success",
      );
    });

    test("should buy wire", () => {
      eventsSystem.buyWire();

      expect(systems.market.buyWire).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Wire purchased!",
        "success",
      );
    });

    test("should toggle wire buyer", () => {
      eventsSystem.toggleWireBuyer();

      expect(systems.market.toggleWireBuyer).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Wire buyer enabled",
        "info",
      );
    });
  });

  describe("Computing Actions", () => {
    test("should buy processor", () => {
      eventsSystem.buyProcessor();

      expect(systems.computing.buyProcessor).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Processor purchased!",
        "success",
      );
    });

    test("should handle processor purchase failure", () => {
      systems.computing.buyProcessor.mockReturnValue(false);

      eventsSystem.buyProcessor();

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Cannot afford processor or trust limit reached",
        "error",
      );
    });

    test("should buy memory", () => {
      eventsSystem.buyMemory();

      expect(systems.computing.buyMemory).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Memory purchased!",
        "success",
      );
    });

    test("should toggle creativity", () => {
      gameState.set("computing.creativity.enabled", false);

      eventsSystem.toggleCreativity();

      expect(systems.computing.setCreativity).toHaveBeenCalledWith(true, 50);
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Creativity enabled",
        "info",
      );
    });

    test("should adjust creativity value", () => {
      const element = { value: "75" };

      eventsSystem.adjustCreativity({}, element);

      expect(systems.computing.setCreativity).toHaveBeenCalledWith(true, 75);
    });
  });

  describe("Combat Actions", () => {
    test("should allocate probe stats successfully", () => {
      // Reset the getElementById spy and set up proper mock returns
      getElementByIdSpy.mockReset();
      getElementByIdSpy.mockImplementation((id) => {
        switch (id) {
          case "probeCombat":
            return { value: "33" };
          case "probeSpeed":
            return { value: "33" };
          case "probeReplication":
            return { value: "34" };
          default:
            return null;
        }
      });

      // Update the global document mock
      global.document.getElementById = getElementByIdSpy;

      eventsSystem.allocateProbeStats(
        mockEvent(),
        mockElement("probeAllocate", "allocateProbeStats"),
      );

      expect(systems.combat.allocateProbeStats).toHaveBeenCalledWith(
        33,
        33,
        34,
      );
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Probe stats allocated",
        "success",
      );
    });

    test("should show error for invalid probe stats", () => {
      getElementByIdSpy.mockReturnValue({ value: "50" });
      systems.combat.allocateProbeStats.mockReturnValue(false);

      eventsSystem.allocateProbeStats(
        mockEvent(),
        mockElement("probeAllocate", "allocateProbeStats"),
      );

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Stats must total 100%",
        "error",
      );
    });

    test("should toggle combat mode", () => {
      gameState.set("combat.battleEnabled", false);

      // Enable combat
      eventsSystem.toggleCombat();
      expect(systems.combat.enableCombat).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Combat enabled",
        "info",
      );

      // Disable combat
      gameState.set("combat.battleEnabled", true);
      eventsSystem.toggleCombat();
      expect(systems.combat.disableCombat).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Combat disabled",
        "info",
      );
    });
  });

  describe("Project Actions", () => {
    test("should complete project successfully", () => {
      const element = { dataset: { projectId: "testProject" } };

      eventsSystem.completeProject({}, element);

      expect(systems.projects.completeProject).toHaveBeenCalledWith(
        "testProject",
      );
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Project completed!",
        "success",
      );
    });

    test("should handle project completion failure", () => {
      const element = { dataset: { projectId: "testProject" } };
      systems.projects.completeProject.mockReturnValue(false);

      eventsSystem.completeProject({}, element);

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Cannot complete project",
        "error",
      );
    });
  });

  describe("Save/Load/Export/Import", () => {
    test("should save game successfully", () => {
      eventsSystem.saveGame();

      expect(gameState.save).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Game saved!",
        "success",
      );
    });

    test("should handle save failure", () => {
      gameState.save.mockReturnValue(false);

      eventsSystem.saveGame();

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Save failed!",
        "error",
      );
    });

    test("should load game successfully", () => {
      eventsSystem.loadGame();

      expect(gameState.load).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Game loaded!",
        "success",
      );
    });

    test("should reset game with confirmation", () => {
      confirmSpy.mockReturnValue(true);

      eventsSystem.resetGame();

      expect(confirmSpy).toHaveBeenCalledWith(
        "Are you sure you want to reset the game? This cannot be undone.",
      );
      expect(gameState.reset).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Game reset!",
        "info",
      );
    });

    test("should cancel reset when not confirmed", () => {
      confirmSpy.mockReturnValue(false);

      eventsSystem.resetGame();

      expect(confirmSpy).toHaveBeenCalled();
      expect(gameState.reset).not.toHaveBeenCalled();
    });

    test("should export save successfully", () => {
      createElementSpy.mockClear();
      const mockAnchor = {
        id: "",
        className: "",
        textContent: "",
        style: { display: "" },
        href: "",
        download: "",
        type: "",
        accept: "",
        click: jest.fn(),
        onchange: null,
      };

      // Make properties writable
      Object.defineProperty(mockAnchor, "href", { writable: true, value: "" });
      Object.defineProperty(mockAnchor, "download", {
        writable: true,
        value: "",
      });

      createElementSpy.mockReturnValue(mockAnchor);
      global.document.createElement = createElementSpy;

      eventsSystem.exportSave(
        mockEvent(),
        mockElement("exportBtn", "exportSave"),
      );

      expect(gameState.export).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toMatch(/^paperclips-save-.*\.json$/);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Save exported!",
        "success",
      );
    });

    test("should handle export failure", () => {
      gameState.export.mockImplementation(() => {
        throw new Error("Export failed");
      });

      eventsSystem.exportSave();

      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Export failed!",
        "error",
      );
    });

    test("should import save successfully", async () => {
      createElementSpy.mockClear();
      const mockFileInput = {
        id: "",
        className: "",
        textContent: "",
        style: { display: "" },
        href: "",
        download: "",
        type: "",
        accept: "",
        click: jest.fn(),
        onchange: null,
      };

      // Make properties writable
      Object.defineProperty(mockFileInput, "type", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFileInput, "accept", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFileInput, "onchange", {
        writable: true,
        value: null,
      });

      createElementSpy.mockReturnValue(mockFileInput);
      global.document.createElement = createElementSpy;

      eventsSystem.importSave(
        mockEvent(),
        mockElement("importBtn", "importSave"),
      );

      expect(mockFileInput.type).toBe("file");
      expect(mockFileInput.accept).toBe(".json");
      expect(mockFileInput.click).toHaveBeenCalled();

      // Simulate file selection
      const mockChangeEvent = {
        target: {
          files: [mockFile],
        },
      };

      mockFileInput.onchange(mockChangeEvent);

      // Wait for FileReader to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(gameState.import).toHaveBeenCalledWith(
        '{"resources":{"clips":100}}',
      );
      expect(eventsSystem.showFeedback).toHaveBeenCalledWith(
        "Save imported!",
        "success",
      );
    });

    test("should handle import with no file selected", () => {
      createElementSpy.mockClear();
      const mockFileInput = {
        id: "",
        className: "",
        textContent: "",
        style: { display: "" },
        href: "",
        download: "",
        type: "",
        accept: "",
        click: jest.fn(),
        onchange: null,
      };

      // Make properties writable
      Object.defineProperty(mockFileInput, "type", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFileInput, "accept", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFileInput, "onchange", {
        writable: true,
        value: null,
      });

      createElementSpy.mockReturnValue(mockFileInput);
      global.document.createElement = createElementSpy;

      eventsSystem.importSave(
        mockEvent(),
        mockElement("importBtn", "importSave"),
      );

      // Simulate no file selected
      const mockChangeEvent = {
        target: {
          files: [],
        },
      };

      // onchange should now be set by the method
      expect(mockFileInput.onchange).toBeInstanceOf(Function);
      mockFileInput.onchange(mockChangeEvent);

      expect(gameState.import).not.toHaveBeenCalled();
    });
  });

  describe("Feedback System", () => {
    test("should create feedback element if not exists", () => {
      getElementByIdSpy.mockClear();
      createElementSpy.mockClear();
      getElementByIdSpy.mockReturnValue(null);

      const mockFeedback = {
        id: "",
        className: "",
        textContent: "",
        style: { display: "" },
        href: "",
        download: "",
        type: "",
        accept: "",
        click: jest.fn(),
        onchange: null,
      };

      // Make properties writable
      Object.defineProperty(mockFeedback, "id", { writable: true, value: "" });
      Object.defineProperty(mockFeedback, "className", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFeedback, "textContent", {
        writable: true,
        value: "",
      });

      createElementSpy.mockReturnValue(mockFeedback);

      // Restore the original showFeedback for this test
      eventsSystem.showFeedback.mockRestore();

      // Mock appendChild to track calls but not throw errors
      const appendChildSpy = jest.fn();
      global.document.body.appendChild = appendChildSpy;
      global.document.getElementById = getElementByIdSpy;
      global.document.createElement = createElementSpy;

      eventsSystem.showFeedback("Test message", "success");

      expect(createElementSpy).toHaveBeenCalledWith("div");
      expect(mockFeedback.id).toBe("feedback");
      expect(mockFeedback.className).toBe("feedback success");
      expect(mockFeedback.textContent).toBe("Test message");
      expect(appendChildSpy).toHaveBeenCalledWith(mockFeedback);

      // Re-mock for other tests
      jest.spyOn(eventsSystem, "showFeedback").mockImplementation(() => {});
    });

    test("should update existing feedback element", () => {
      getElementByIdSpy.mockClear();
      const mockFeedback = {
        id: "feedback",
        className: "feedback",
        textContent: "",
        style: { display: "" },
      };

      // Make properties writable
      Object.defineProperty(mockFeedback, "textContent", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFeedback, "className", {
        writable: true,
        value: "feedback",
      });
      Object.defineProperty(mockFeedback.style, "display", {
        writable: true,
        value: "",
      });

      getElementByIdSpy.mockReturnValue(mockFeedback);
      // Restore the original showFeedback for this test
      eventsSystem.showFeedback.mockRestore();

      global.document.getElementById = getElementByIdSpy;

      eventsSystem.showFeedback("Updated message", "error");

      expect(mockFeedback.textContent).toBe("Updated message");
      expect(mockFeedback.className).toBe("feedback error");
      expect(mockFeedback.style.display).toBe("block");

      // Re-mock for other tests
      jest.spyOn(eventsSystem, "showFeedback").mockImplementation(() => {});
    });

    test("should auto-hide feedback after timeout", () => {
      jest.useFakeTimers();
      getElementByIdSpy.mockClear();

      const mockFeedback = {
        id: "feedback",
        className: "feedback",
        textContent: "",
        style: { display: "" },
      };

      // Make properties writable
      Object.defineProperty(mockFeedback, "textContent", {
        writable: true,
        value: "",
      });
      Object.defineProperty(mockFeedback, "className", {
        writable: true,
        value: "feedback",
      });
      Object.defineProperty(mockFeedback.style, "display", {
        writable: true,
        value: "",
      });

      getElementByIdSpy.mockReturnValue(mockFeedback);
      // Restore the original showFeedback for this test
      eventsSystem.showFeedback.mockRestore();

      global.document.getElementById = getElementByIdSpy;

      eventsSystem.showFeedback("Temporary message", "info");

      expect(mockFeedback.style.display).toBe("block");

      jest.advanceTimersByTime(3000);

      expect(mockFeedback.style.display).toBe("none");

      // Re-mock for other tests
      jest.spyOn(eventsSystem, "showFeedback").mockImplementation(() => {});

      jest.useRealTimers();
    });
  });

  describe("Custom Handlers and Shortcuts", () => {
    test("should add custom handler", () => {
      const customHandler = jest.fn();
      eventsSystem.addHandler("customAction", customHandler);

      expect(eventsSystem.handlers.has("customAction")).toBe(true);
      expect(eventsSystem.handlers.get("customAction")).toBe(customHandler);
    });

    test("should remove handler", () => {
      eventsSystem.removeHandler("makeClip");

      expect(eventsSystem.handlers.has("makeClip")).toBe(false);
    });

    test("should add custom shortcut", () => {
      const customShortcut = jest.fn();
      eventsSystem.addShortcut("ctrl+k", customShortcut);

      expect(eventsSystem.shortcuts.has("ctrl+k")).toBe(true);
      expect(eventsSystem.shortcuts.get("ctrl+k")).toBe(customShortcut);
    });

    test("should remove shortcut", () => {
      eventsSystem.removeShortcut(" ");

      expect(eventsSystem.shortcuts.has(" ")).toBe(false);
    });
  });

  describe("Statistics and Cleanup", () => {
    test("should return system statistics", () => {
      const stats = eventsSystem.getStats();

      expect(stats.handlers).toBe(eventsSystem.handlers.size);
      expect(stats.shortcuts).toBe(eventsSystem.shortcuts.size);
      expect(stats.activeEvents).toBe(4);
    });

    test("should cleanup event listeners", () => {
      removeEventListenerSpy.mockClear();
      global.document.removeEventListener = removeEventListenerSpy;

      eventsSystem.cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "click",
        eventsSystem.boundHandlers.click,
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "change",
        eventsSystem.boundHandlers.change,
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "input",
        eventsSystem.boundHandlers.input,
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        eventsSystem.boundHandlers.keydown,
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle missing systems gracefully", () => {
      const eventsWithoutSystems = new EventsSystem(gameState, {});

      // Should not throw when systems are missing
      expect(() => eventsWithoutSystems.makeClip()).not.toThrow();
      expect(() => eventsWithoutSystems.buyAutoClipper()).not.toThrow();
      expect(() => eventsWithoutSystems.raisePrice()).not.toThrow();
    });

    test("should handle invalid input values", () => {
      const element = { value: "invalid" };

      eventsSystem.adjustCreativity({}, element);

      expect(systems.computing.setCreativity).toHaveBeenCalledWith(true, NaN);
    });

    test("should handle missing DOM elements in probe allocation", () => {
      getElementByIdSpy.mockReturnValue(null);
      global.document.getElementById = getElementByIdSpy;

      eventsSystem.allocateProbeStats();

      expect(systems.combat.allocateProbeStats).toHaveBeenCalledWith(0, 0, 0);
    });

    test("should handle keyboard shortcut errors", () => {
      const errorShortcut = jest.fn().mockImplementation(() => {
        throw new Error("Shortcut error");
      });
      eventsSystem.shortcuts.set("ctrl+e", errorShortcut);

      const event = {
        key: "e",
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      // Should not throw
      expect(() => eventsSystem.handleKeyboard(event)).not.toThrow();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test("should handle confirmReset calling resetGame", () => {
      confirmSpy.mockReturnValue(true);
      const resetGameSpy = jest.spyOn(eventsSystem, "resetGame");

      eventsSystem.confirmReset();

      expect(confirmSpy).toHaveBeenCalledWith(
        "Reset game? Press OK to confirm, Cancel to continue playing.",
      );
      expect(resetGameSpy).toHaveBeenCalled();
    });
  });
});
