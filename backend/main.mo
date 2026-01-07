import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import List "mo:core/List";
import Float "mo:core/Float";
import Option "mo:core/Option";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  type FileReference = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
  };

  type Category = {
    #food;
    #transportation;
    #entertainment;
    #shopping;
    #bills;
    #healthcare;
    #other;
  };

  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      let toNat = func(cat : Category) : Nat {
        switch (cat) {
          case (#food) { 0 };
          case (#transportation) { 1 };
          case (#entertainment) { 2 };
          case (#shopping) { 3 };
          case (#bills) { 4 };
          case (#healthcare) { 5 };
          case (#other) { 6 };
        };
      };
      Nat.compare(toNat(category1), toNat(category2));
    };
  };

  type Expense = {
    id : Nat;
    amount : Float;
    description : Text;
    date : Time.Time;
    category : Category;
    source : Text;
  };

  module Expense {
    public func compare(expense1 : Expense, expense2 : Expense) : Order.Order {
      switch (Float.compare(expense1.amount, expense2.amount)) {
        case (#equal) { Text.compare(expense1.description, expense2.description) };
        case (other) { other };
      };
    };
  };

  type Rule = {
    keyword : Text;
    category : Category;
  };

  module Rule {
    public func compare(rule1 : Rule, rule2 : Rule) : Order.Order {
      Text.compare(rule1.keyword, rule2.keyword);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let expenses = Map.empty<Principal, List.List<Expense>>();
  let categorizationRules = List.empty<Rule>();
  var nextExpenseId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addExpense(amount : Float, description : Text, date : Time.Time, source : Text) : async Expense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };

    let category = categorizeExpense(description);
    let expense : Expense = {
      id = nextExpenseId;
      amount;
      description;
      date;
      category;
      source;
    };

    let userExpenses = switch (expenses.get(caller)) {
      case (null) { List.empty<Expense>() };
      case (?existing) { existing };
    };
    userExpenses.add(expense);
    expenses.add(caller, userExpenses);
    nextExpenseId += 1;
    expense;
  };

  func categorizeExpense(description : Text) : Category {
    for (rule in categorizationRules.values()) {
      if (description.toLower().contains(#text(rule.keyword.toLower()))) {
        return rule.category;
      };
    };
    #other;
  };

  public shared ({ caller }) func updateCategorizationRules(newRules : [Rule]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update rules");
    };

    categorizationRules.clear();
    for (rule in newRules.values()) {
      categorizationRules.add(rule);
    };
  };

  public query ({ caller }) func getUserExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };

    switch (expenses.get(caller)) {
      case (null) { [] };
      case (?userExpenses) { userExpenses.values().toArray() };
    };
  };

  public query ({ caller }) func getExpensesForUser(user : Principal) : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access other users' expenses");
    };

    switch (expenses.get(user)) {
      case (null) { [] };
      case (?userExpenses) { userExpenses.values().toArray() };
    };
  };

  public query ({ caller }) func getExpenseSummaryByCategory() : async [(Category, Float)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view summaries");
    };

    let categoryTotals = List.empty<(Category, Float)>();

    for (category in [#food, #transportation, #entertainment, #shopping, #bills, #healthcare, #other].values()) {
      let total = switch (expenses.get(caller)) {
        case (null) { 0.0 };
        case (?userExpenses) {
          userExpenses.filter(func(expense) { expense.category == category }).values().toArray().foldLeft(
            0.0,
            func(acc, expense) { acc + expense.amount },
          );
        };
      };
      categoryTotals.add((category, total));
    };

    categoryTotals.toArray();
  };

  public shared ({ caller }) func uploadCSVFile(file : Storage.ExternalBlob, name : Text) : async FileReference {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };

    let ref : FileReference = {
      id = name;
      blob = file;
      name;
    };
    ref;
  };
};
