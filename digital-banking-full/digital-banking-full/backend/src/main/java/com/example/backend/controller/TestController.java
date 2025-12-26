package com.example.backend.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Employee;
import com.example.backend.model.Role;
import com.example.backend.repository.EmployeeRepository;

@RestController
@RequestMapping("/api")
public class TestController {

    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;

    public TestController(PasswordEncoder passwordEncoder, EmployeeRepository employeeRepository) {
        this.passwordEncoder = passwordEncoder;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/test")
    public String test() {
        return "Backend je uspešno pokrenut!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }

    @GetMapping("/generate-hash")
    public Map<String, String> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        return response;
    }

    @RequestMapping(value = "/create-admin", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Map<String, Object>> createAdmin() {
        try {
            // Proveri da li admin već postoji
            if (employeeRepository.findByEmail("admin@bank.com").isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin korisnik već postoji!");
                return ResponseEntity.ok(response);
            }

            // Kreiraj Employee (koji nasleđuje User)
            Employee admin = Employee.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@bank.com")
                    .firstName("Admin")
                    .lastName("User")
                    .phoneNumber("+381600000000")
                    .role(Role.ADMIN)
                    .active(true)
                    .employeeNumber("EMP-ADMIN-001")
                    .hireDate(LocalDate.now())
                    .position("System Administrator")
                    .department("IT")
                    .salary(BigDecimal.ZERO)
                    .canApproveTransactions(true)
                    .build();

            Employee saved = employeeRepository.save(admin);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Admin korisnik je uspešno kreiran!");
            response.put("id", saved.getId());
            response.put("email", saved.getEmail());
            response.put("role", saved.getRole());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Greška pri kreiranju admin korisnika: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @RequestMapping(value = "/create-employee", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Map<String, Object>> createEmployee(
            @RequestParam(required = false, defaultValue = "employee@bank.com") String email,
            @RequestParam(required = false, defaultValue = "employee123") String password,
            @RequestParam(required = false, defaultValue = "Employee") String firstName,
            @RequestParam(required = false, defaultValue = "User") String lastName) {
        try {
            // Proveri da li employee već postoji
            if (employeeRepository.findByEmail(email).isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Employee korisnik sa email-om " + email + " već postoji!");
                return ResponseEntity.ok(response);
            }

            // Generiši employee number
            String employeeNumber = "EMP-" + System.currentTimeMillis();

            // Kreiraj Employee
            Employee employee = Employee.builder()
                    .username(email.split("@")[0]) // Koristi deo pre @ kao username
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .phoneNumber("+381600000001")
                    .role(Role.EMPLOYEE)
                    .active(true)
                    .employeeNumber(employeeNumber)
                    .hireDate(LocalDate.now())
                    .position("Bank Employee")
                    .department("Operations")
                    .salary(BigDecimal.valueOf(50000))
                    .canApproveTransactions(false)
                    .build();

            Employee saved = employeeRepository.save(employee);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employee korisnik je uspešno kreiran!");
            response.put("id", saved.getId());
            response.put("email", saved.getEmail());
            response.put("password", password);
            response.put("role", saved.getRole());
            response.put("employeeNumber", saved.getEmployeeNumber());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Greška pri kreiranju employee korisnika: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
