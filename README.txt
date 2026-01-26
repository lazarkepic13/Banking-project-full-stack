	
	Digital Banking - full stack aplikacija


1) Opis projekta:

Aplikacija za upravljanje bankarskim sistemom.

Funkcije:

- Registracija i autentifikacija korisnika (klijenti, zaposleni, admini)
- Upravljanjee racunima (kreiranje, blokiranje, aktiviranje)
- Upravljanje karticama
- Izvrsavanje transakcija (depozit, podizanje novca, transfer sa jednog racuna na drugi)
- Admin panel za upravljanje korisnicima i transakcijama.
- Employee panel za kreirannje kartica i odobravanje kartica.


2) Tehnologije:

Backend: 
- Java 17
- Spring Boot 3.2.0
- SQL Server baza podataka
- Maven

Frontend:
- Angular 21
- Typescript
- RxJS
- SCSS


3) Baza podataka:

- SQL server (SQLEXPRESS)
- Database name: digital_banking
- PORT: default SQL server port (1433 ili SQLEXPRESS instance)


4) Pokretanje Backend-a:

- Konektovati se na bazu podataka i napraviti bazu sa imenom digital_banking
- Otvoriti terminal u folderu digital-banking-full/digital-banking-full/backend (nije greska 2x isti folder..)
- Windows komanda za terminal: .\mvnw.cmd spring-boot:run
- Linux/Mac komanda:  .\mvnw spring-boot:run
- Ako je Maven vec instaliran: mvn spring-boot:run

Backend se pokrece na adresi http://localhost:8080
API endpoint na: http://localhost:8080/api


5) Pokretanje Frontend-a:

- Otvoriti terminal u folderu digital-banking-full/frontend (nema 2x digital-banking-full kao kod backenda..)
- Instalirati dependencies komandom: npm install
- Pokrenuti frontend komandom: npm start  ILI  ng serve

Frontend se pokrece na adresi http://localhost:4200


6) Testiranje

Backend testovi: cd digital-banking-full/digital-banking-full/backend 
mvn test

Frontend testovi: cd digital-banking-full/frontend
npm test




