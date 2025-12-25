package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.dto.CreateAccountRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.Account;
import com.example.backend.model.AccountStatus;
import com.example.backend.model.Customer;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.CustomerRepository;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

    public AccountService(AccountRepository accountRepository, CustomerRepository customerRepository) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public Optional<Account> getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber);
    }

    public List<Account> getAccountsByCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        return accountRepository.findByCustomer(customer);
    }

    public Account createAccount(CreateAccountRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + request.getCustomerId()));

        Account account = Account.builder()
                .accountType(request.getAccountType())
                .accountNumber(generateAccountNumber())
                .balance(java.math.BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .customer(customer)
                .build();

        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, Account accountDetails) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        account.setAccountNumber(accountDetails.getAccountNumber());
        account.setAccountType(accountDetails.getAccountType());
        account.setBalance(accountDetails.getBalance());
        account.setStatus(accountDetails.getStatus());

        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new ResourceNotFoundException("Account not found with id: " + id);
        }
        accountRepository.deleteById(id);
    }

    public Account blockAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        account.setStatus(AccountStatus.BLOCKED);
        return accountRepository.save(account);
    }

    public Account activateAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));

        account.setStatus(AccountStatus.ACTIVE);
        return accountRepository.save(account);
    }

    private String generateAccountNumber() {
        return "ACC" + System.currentTimeMillis();
    }
}
