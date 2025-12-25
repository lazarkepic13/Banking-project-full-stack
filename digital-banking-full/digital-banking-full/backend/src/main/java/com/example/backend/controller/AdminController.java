package com.example.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Account;
import com.example.backend.model.Customer;
import com.example.backend.model.Transaction;
import com.example.backend.repository.EmployeeRepository;
import com.example.backend.service.AccountService;
import com.example.backend.service.CustomerService;
import com.example.backend.service.TransactionService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CustomerService customerService;
    private final EmployeeRepository employeeRepository;
    private final AccountService accountService;
    private final TransactionService transactionService;

    public AdminController(
            CustomerService customerService,
            EmployeeRepository employeeRepository,
            AccountService accountService,
            TransactionService transactionService) {
        this.customerService = customerService;
        this.employeeRepository = employeeRepository;
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, List<?>>> getAllUsers() {
        Map<String, List<?>> users = new HashMap<>();
        users.put("customers", customerService.getAllCustomers());
        users.put("employees", employeeRepository.findAll());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        List<Account> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        List<Transaction> transactions = transactionService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/customers/{id}/block")
    public ResponseEntity<Customer> blockCustomer(@PathVariable Long id) {
        Customer customer = customerService.blockCustomer(id);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/customers/{id}/unblock")
    public ResponseEntity<Customer> unblockCustomer(@PathVariable Long id) {
        Customer customer = customerService.unblockCustomer(id);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/accounts/{id}/block")
    public ResponseEntity<Account> blockAccount(@PathVariable Long id) {
        Account account = accountService.blockAccount(id);
        return ResponseEntity.ok(account);
    }

    @PutMapping("/accounts/{id}/activate")
    public ResponseEntity<Account> activateAccount(@PathVariable Long id) {
        Account account = accountService.activateAccount(id);
        return ResponseEntity.ok(account);
    }
}
