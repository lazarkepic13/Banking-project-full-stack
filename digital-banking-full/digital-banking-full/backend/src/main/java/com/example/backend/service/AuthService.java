package com.example.backend.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.Customer;
import com.example.backend.model.Employee;
import com.example.backend.repository.CustomerRepository;
import com.example.backend.repository.EmployeeRepository;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(CustomerRepository customerRepository, EmployeeRepository employeeRepository,
            JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> login(String email, String password) {
        Optional<Customer> customer = customerRepository.findByEmail(email);
        Optional<Employee> employee = employeeRepository.findByEmail(email);

        if (customer.isPresent()) {
            Customer cust = customer.get();
            if (passwordEncoder.matches(password, cust.getPassword())) {
                String token = jwtService.generateToken(email, "CUSTOMER", cust.getId());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", cust);
                response.put("role", "CUSTOMER");
                return response;
            }
        }

        if (employee.isPresent()) {
            Employee emp = employee.get();
            if (passwordEncoder.matches(password, emp.getPassword())) {
                String token = jwtService.generateToken(email, emp.getRole().toString(), emp.getId());
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", emp);
                response.put("role", emp.getRole().toString());
                return response;
            }
        }

        throw new UnauthorizedException("Invalid email or password");
    }

    public Customer register(Customer customer) {
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        String hashedPassword = passwordEncoder.encode(customer.getPassword());
        customer.setPassword(hashedPassword);

        return customerRepository.save(customer);
    }
}
