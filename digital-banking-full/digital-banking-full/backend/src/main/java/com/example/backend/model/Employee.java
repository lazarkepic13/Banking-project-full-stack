package com.example.backend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "employees")
@PrimaryKeyJoinColumn(name = "user_id")
public class Employee extends User {

    @Column(nullable = false, unique = true, length = 20)
    private String employeeNumber;

    @Column(nullable = false)
    private LocalDate hireDate;

    @Column(nullable = false, length = 100)
    private String position;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(precision = 10, scale = 2)
    private BigDecimal salary;

    @Column(nullable = false)
    private Boolean canApproveTransactions = false;

    @PrePersist
    @Override
    protected void onCreate() {
        super.onCreate();
        if (this.role == null) {
            this.role = Role.EMPLOYEE;
        }
        if (this.canApproveTransactions == null) {
            this.canApproveTransactions = false;
        }
    }
}
