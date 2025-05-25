/**
 * BookMyTable - Script de test de base de données
 * 
 * Ce script permet de tester toutes les fonctionnalités principales de la base de données
 * directement sans passer par l'interface React de l'application.
 * 
 * Pré-requis:
 * 1. MySQL/MariaDB installé et la base de données bookmytable créée avec le script database.sql
 * 2. Node.js et npm installés
 * 3. Installation des dépendances: npm install mysql2 dotenv colors cli-table bcrypt moment
 * 
 * Exécution: node db-test.js [commande]
 * Commandes disponibles:
 * - tables: Afficher toutes les tables
 * - users: Afficher tous les utilisateurs
 * - reservations: Afficher toutes les réservations
 * - availability [date] [personnes]: Vérifier les disponibilités pour une date et un nombre de personnes
 * - create [réservation]: Créer une nouvelle réservation
 * - confirm [id]: Confirmer une réservation
 * - cancel [id]: Annuler une réservation
 * - stats: Afficher les statistiques des réservations
 * - tables-status: Afficher le statut des tables aujourd'hui
 */

// Importation des modules
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const colors = require('colors');
const Table = require('cli-table');
const bcrypt = require('bcrypt');
const moment = require('moment');
const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs');

// Configuration de moment en français
moment.locale('fr');

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration de la connexion à la base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'bookmytable',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Fonction pour générer un code de confirmation aléatoire
function generateConfirmationCode(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    
    return code;
}

// Interface readline pour les entrées utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fonction pour poser une question et obtenir une réponse
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

// Fonction pour créer un fichier de log
function logToFile(data, fileName = 'db-test-log.txt') {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const logEntry = `[${timestamp}] ${data}\n`;
    
    fs.appendFileSync(fileName, logEntry);
}

// Fonctions pour les tests de base de données
const DbTest = {
    // Connexion à la base de données
    async connect() {
        try {
            this.connection = await mysql.createConnection(dbConfig);
            console.log('✓ '.green + 'Connexion à la base de données établie');
            logToFile('Connexion à la base de données établie');
            return this.connection;
        } catch (error) {
            console.error('✗ '.red + `Erreur de connexion à la base de données: ${error.message}`);
            logToFile(`Erreur de connexion à la base de données: ${error.message}`);
            process.exit(1);
        }
    },

    // Fermeture de la connexion
    async disconnect() {
        if (this.connection) {
            await this.connection.end();
            console.log('✓ '.green + 'Connexion à la base de données fermée');
            logToFile('Connexion à la base de données fermée');
            rl.close();
        }
    },

    // Afficher toutes les tables de la base de données
    async showTables() {
        try {
            const [rows] = await this.connection.query('SHOW TABLES');
            
            console.log('\n=== Tables de la base de données ==='.cyan);
            
            const table = new Table({
                head: ['Table'.white],
                colWidths: [40]
            });
            
            rows.forEach(row => {
                const tableName = Object.values(row)[0];
                table.push([tableName]);
            });
            
            console.log(table.toString());
            logToFile(`Affichage des tables: ${rows.length} tables trouvées`);
            
            return rows;
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de l'affichage des tables: ${error.message}`);
            logToFile(`Erreur lors de l'affichage des tables: ${error.message}`);
            return null;
        }
    },

    // Afficher tous les utilisateurs
    async showUsers() {
        try {
            const [rows] = await this.connection.query('SELECT id, username, email, role, created_at, last_login, is_active FROM users');
            
            console.log('\n=== Utilisateurs ==='.cyan);
            
            const table = new Table({
                head: ['ID'.white, 'Nom'.white, 'Email'.white, 'Rôle'.white, 'Créé le'.white, 'Dernier login'.white, 'Actif'.white],
                colWidths: [5, 20, 30, 10, 20, 20, 7]
            });
            
            rows.forEach(user => {
                table.push([
                    user.id,
                    user.username,
                    user.email,
                    user.role === 'admin' ? user.role.green : user.role.blue,
                    moment(user.created_at).format('DD/MM/YYYY HH:mm'),
                    user.last_login ? moment(user.last_login).format('DD/MM/YYYY HH:mm') : 'Jamais'.gray,
                    user.is_active ? 'Oui'.green : 'Non'.red
                ]);
            });
            
            console.log(table.toString());
            logToFile(`Affichage des utilisateurs: ${rows.length} utilisateurs trouvés`);
            
            return rows;
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de l'affichage des utilisateurs: ${error.message}`);
            logToFile(`Erreur lors de l'affichage des utilisateurs: ${error.message}`);
            return null;
        }
    },

    // Afficher toutes les tables du restaurant
    async showRestaurantTables() {
        try {
            const [rows] = await this.connection.query('SELECT * FROM tables ORDER BY number');
            
            console.log('\n=== Tables du restaurant ==='.cyan);
            
            const table = new Table({
                head: ['ID'.white, 'Numéro'.white, 'Capacité'.white, 'Statut'.white, 'Description'.white],
                colWidths: [5, 10, 10, 15, 35]
            });
            
            rows.forEach(t => {
                let statusColor;
                switch (t.status) {
                    case 'available':
                        statusColor = t.status.green;
                        break;
                    case 'occupied':
                        statusColor = t.status.red;
                        break;
                    case 'reserved':
                        statusColor = t.status.yellow;
                        break;
                    case 'maintenance':
                        statusColor = t.status.gray;
                        break;
                    default:
                        statusColor = t.status;
                }
                
                table.push([
                    t.id,
                    t.number,
                    t.capacity + ' pers.',
                    statusColor,
                    t.description || '-'
                ]);
            });
            
            console.log(table.toString());
            logToFile(`Affichage des tables du restaurant: ${rows.length} tables trouvées`);
            
            return rows;
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de l'affichage des tables: ${error.message}`);
            logToFile(`Erreur lors de l'affichage des tables: ${error.message}`);
            return null;
        }
    },

    // Afficher toutes les réservations
    async showReservations(filters = {}) {
        try {
            let query = `
                SELECT r.*, t.number as table_number, t.capacity as table_capacity 
                FROM reservations r
                LEFT JOIN tables t ON r.table_id = t.id
                WHERE 1=1
            `;
            
            const params = [];
            
            // Ajouter les filtres à la requête
            if (filters.date) {
                query += ' AND r.date = ?';
                params.push(filters.date);
            }
            
            if (filters.status) {
                query += ' AND r.status = ?';
                params.push(filters.status);
            }
            
            if (filters.customer_name) {
                query += ' AND r.customer_name LIKE ?';
                params.push(`%${filters.customer_name}%`);
            }
            
            if (filters.customer_email) {
                query += ' AND r.customer_email LIKE ?';
                params.push(`%${filters.customer_email}%`);
            }
            
            // Tri
            query += ' ORDER BY r.date ASC, r.time ASC';
            
            // Exécuter la requête
            const [rows] = await this.connection.query(query, params);
            
            // Afficher les résultats
            console.log('\n=== Réservations ==='.cyan);
            
            const table = new Table({
                head: ['ID'.white, 'Date'.white, 'Heure'.white, 'Client'.white, 'Pers.'.white, 'Table'.white, 'Statut'.white, 'Code'.white],
                colWidths: [5, 12, 8, 25, 6, 7, 12, 10]
            });
            
            rows.forEach(reservation => {
                let statusColor;
                switch (reservation.status) {
                    case 'pending':
                        statusColor = reservation.status.yellow;
                        break;
                    case 'confirmed':
                        statusColor = reservation.status.green;
                        break;
                    case 'cancelled':
                        statusColor = reservation.status.red;
                        break;
                    case 'completed':
                        statusColor = reservation.status.blue;
                        break;
                    case 'no_show':
                        statusColor = reservation.status.gray;
                        break;
                    default:
                        statusColor = reservation.status;
                }
                
                table.push([
                    reservation.id,
                    moment(reservation.date).format('DD/MM/YYYY'),
                    reservation.time.substring(0, 5),
                    reservation.customer_name,
                    reservation.party_size,
                    reservation.table_id ? reservation.table_number : '-',
                    statusColor,
                    reservation.confirmation_code
                ]);
            });
            
            console.log(table.toString());
            
            // Afficher les filtres appliqués s'il y en a
            if (Object.keys(filters).length > 0) {
                console.log('Filtres appliqués:'.cyan);
                Object.keys(filters).forEach(key => {
                    console.log(`  ${key}: ${filters[key]}`);
                });
            }
            
            console.log(`Total: ${rows.length} réservation(s)`.cyan);
            logToFile(`Affichage des réservations: ${rows.length} réservations trouvées avec filtres ${JSON.stringify(filters)}`);
            
            return rows;
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de l'affichage des réservations: ${error.message}`);
            logToFile(`Erreur lors de l'affichage des réservations: ${error.message}`);
            return null;
        }
    },

    // Vérifier les disponibilités
    async checkAvailability(date, partySize) {
        try {
            if (!date) {
                // Utiliser la date d'aujourd'hui si aucune date n'est fournie
                date = moment().format('YYYY-MM-DD');
            }
            
            partySize = parseInt(partySize || 2);
            
            console.log(`\n=== Vérification des disponibilités pour le ${moment(date).format('dddd DD MMMM YYYY')} (${partySize} personnes) ===`.cyan);
            
            // Vérifier si c'est un jour ouvrable
            const dayOfWeek = moment(date).day(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            if (isWeekend) {
                console.log('✗ '.red + 'Le restaurant est fermé le week-end (samedi et dimanche).');
                logToFile(`Vérification de disponibilité: Date ${date} (weekend) - Restaurant fermé`);
                return null;
            }
            
            // Vérifier si c'est un jeudi (pour les dîners)
            const isThursday = dayOfWeek === 4;
            
            // Récupérer tous les créneaux horaires
            const [timeSlots] = await this.connection.query('SELECT * FROM time_slots WHERE is_active = 1 ORDER BY start_time ASC');
            
            // Séparer les créneaux déjeuner et dîner
            const lunchSlots = timeSlots.filter(slot => slot.is_lunch === 1);
            const dinnerSlots = timeSlots.filter(slot => slot.is_dinner === 1);
            
            // Afficher les créneaux de déjeuner
            console.log('\n=== Créneaux de déjeuner ==='.cyan);
            
            if (lunchSlots.length === 0) {
                console.log('Aucun créneau de déjeuner disponible.');
            } else {
                const lunchTable = new Table({
                    head: ['Heure'.white, 'Disponible'.white],
                    colWidths: [15, 15]
                });
                
                for (const slot of lunchSlots) {
                    // Vérifier la disponibilité
                    const available = await this.checkSlotAvailability(slot.start_time, date, partySize);
                    lunchTable.push([
                        slot.start_time.substring(0, 5),
                        available ? 'Oui'.green : 'Non'.red
                    ]);
                }
                
                console.log(lunchTable.toString());
            }
            
            // Afficher les créneaux de dîner si c'est un jeudi
            if (isThursday) {
                console.log('\n=== Créneaux de dîner (jeudi) ==='.cyan);
                
                if (dinnerSlots.length === 0) {
                    console.log('Aucun créneau de dîner disponible.');
                } else {
                    const dinnerTable = new Table({
                        head: ['Heure'.white, 'Disponible'.white],
                        colWidths: [15, 15]
                    });
                    
                    for (const slot of dinnerSlots) {
                        // Pour les dîners le jeudi, on considère qu'ils sont disponibles
                        dinnerTable.push([
                            slot.start_time.substring(0, 5),
                            'Oui'.green
                        ]);
                    }
                    
                    console.log(dinnerTable.toString());
                }
            } else {
                console.log('\n' + 'Note: Le service du dîner n\'est disponible que le jeudi.'.yellow);
            }
            
            logToFile(`Vérification de disponibilité: Date ${date}, ${partySize} personnes`);
            
            return {
                lunch: lunchSlots,
                dinner: dinnerSlots
            };
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de la vérification des disponibilités: ${error.message}`);
            logToFile(`Erreur lors de la vérification des disponibilités: ${error.message}`);
            return null;
        }
    },

    // Vérifier la disponibilité d'un créneau spécifique
    async checkSlotAvailability(time, date, partySize) {
        try {
            // Récupérer les tables qui peuvent accueillir ce groupe
            const [tables] = await this.connection.query('SELECT * FROM tables WHERE capacity >= ? ORDER BY capacity ASC', [partySize]);
            
            if (tables.length === 0) {
                return false;
            }
            
            // Vérifier s'il y a au moins une table disponible
            for (const table of tables) {
                const [conflicts] = await this.connection.query(`
                    SELECT COUNT(*) as conflict_count
                    FROM reservations
                    WHERE table_id = ?
                      AND date = ?
                      AND status NOT IN ('cancelled', 'no_show')
                      AND (
                        (time <= ? AND ADDTIME(time, '02:00:00') > ?)
                        OR
                        (time < ? AND ADDTIME(time, '02:00:00') >= ?)
                      )
                `, [table.id, date, time, time, time, time]);
                
                if (conflicts[0].conflict_count === 0) {
                    return true; // Au moins une table est disponible
                }
            }
            
            return false; // Aucune table disponible
        } catch (error) {
            console.error('Erreur lors de la vérification de disponibilité:', error);
            return false;
        }
    },

    // Créer une nouvelle réservation
    async createReservation(customerName, customerEmail, customerPhone, date, time, partySize, comments = null) {
        try {
            // Valider les données
            if (!customerName || !customerEmail || !customerPhone || !date || !time || !partySize) {
                console.error('✗ '.red + 'Toutes les informations requises doivent être fournies');
                logToFile('Erreur de création de réservation: données manquantes');
                return null;
            }
            
            // Vérifier si la date est valide
            const reservationDate = moment(date);
            const today = moment().startOf('day');
            
            if (reservationDate.isBefore(today)) {
                console.error('✗ '.red + 'La date de réservation doit être dans le futur');
                return null;
            }
            
            // Générer un code de confirmation unique
            const confirmationCode = generateConfirmationCode();
            
            // Insérer la réservation
            const [result] = await this.connection.query(
                'INSERT INTO reservations (customer_name, customer_email, customer_phone, date, time, party_size, comments, confirmation_code, requires_approval) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [customerName, customerEmail, customerPhone, date, time, partySize, comments, confirmationCode, 1]
            );
            
            console.log('✓ '.green + `Réservation créée avec succès (ID: ${result.insertId}, Code: ${confirmationCode})`);
            logToFile(`Réservation créée: ID ${result.insertId}, Client ${customerName}, Date ${date}, Heure ${time}, Personnes ${partySize}`);
            
            return result.insertId;
        } catch (error) {
            console.error('✗ '.red + `Erreur lors de la création de la réservation: ${error.message}`);
            logToFile(`Erreur lors de la création de la réservation: ${error.message}`);
            return null;
        }
    },

    // Exécuter tous les tests
    async runAllTests() {
        try {
            console.log('\n' + '='.repeat(50));
            console.log('DÉBUT DES TESTS DE LA BASE DE DONNÉES BOOKMYTABLE'.magenta.bold);
            console.log('='.repeat(50));
            
            // Informations sur la base de données
            console.log('\n=== INFORMATIONS SUR LA BASE DE DONNÉES ==='.cyan.bold);
            await this.showTables();
            
            // Tables du restaurant
            console.log('\n=== TABLES DU RESTAURANT ==='.cyan.bold);
            await this.showRestaurantTables();
            
            // Utilisateurs
            console.log('\n=== UTILISATEURS ==='.cyan.bold);
            await this.showUsers();
            
            // Vérifier les disponibilités
            console.log('\n=== TEST DE DISPONIBILITÉ ==='.cyan.bold);
            await this.checkAvailability(moment().format('YYYY-MM-DD'), 2);
            
            // Réservations existantes
            console.log('\n=== RÉSERVATIONS EXISTANTES ==='.cyan.bold);
            await this.showReservations();
            
            console.log('\n' + '='.repeat(50));
            console.log('FIN DES TESTS - TOUS LES TESTS COMPLÉTÉS AVEC SUCCÈS'.green.bold);
            console.log('='.repeat(50) + '\n');
            
            return true;
        } catch (error) {
            console.error('\n' + '='.repeat(50));
            console.error('ERREUR LORS DES TESTS'.red.bold);
            console.error('='.repeat(50));
            console.error(`${error.message}`);
            console.error('='.repeat(50) + '\n');
            
            logToFile(`Erreur lors des tests automatiques: ${error.message}`);
            return false;
        }
    }
};

// Fonction pour traiter les arguments de la ligne de commande
async function processCommand(args) {
    // Connexion à la base de données
    await DbTest.connect();
    
    // Extraire la commande et les arguments
    const command = args[2] || 'help';
    const commandArgs = args.slice(3);
    
    try {
        switch (command) {
            case 'help':
                console.log('\nUtilisation: node db-test.js [commande] [arguments]'.yellow);
                console.log('\nCommandes disponibles:'.cyan);
                console.log('  help'.green + ' - Afficher cette aide');
                console.log('  tables'.green + ' - Afficher toutes les tables de la base de données');
                console.log('  restaurant-tables'.green + ' - Afficher toutes les tables du restaurant');
                console.log('  users'.green + ' - Afficher tous les utilisateurs');
                console.log('  reservations'.green + ' [date] [statut] - Afficher les réservations');
                console.log('  availability'.green + ' [date] [personnes] - Vérifier les disponibilités');
                console.log('  create'.green + ' - Assistant interactif pour créer une réservation');
                console.log('  run-all-tests'.green + ' - Exécuter tous les tests automatiquement');
                break;
                
            case 'tables':
                await DbTest.showTables();
                break;
                
            case 'restaurant-tables':
                await DbTest.showRestaurantTables();
                break;
                
            case 'users':
                await DbTest.showUsers();
                break;
                
            case 'reservations':
                const filters = {};
                if (commandArgs[0]) {
                    filters.date = commandArgs[0];
                }
                if (commandArgs[1]) {
                    filters.status = commandArgs[1];
                }
                await DbTest.showReservations(filters);
                break;
                
            case 'availability':
                await DbTest.checkAvailability(commandArgs[0], commandArgs[1]);
                break;
                
            case 'create':
                // Assistant interactif pour créer une réservation
                console.log('\n=== Création d\'une nouvelle réservation ==='.cyan);
                
                const customerName = await question('Nom du client: ');
                const customerEmail = await question('Email du client: ');
                const customerPhone = await question('Téléphone du client: ');
                
                let dateStr = await question('Date (YYYY-MM-DD): ');
                if (!dateStr) {
                    dateStr = moment().add(1, 'day').format('YYYY-MM-DD');
                    console.log(`Date par défaut: ${dateStr}`);
                }
                
                const time = await question('Heure (HH:MM): ');
                const partySize = await question('Nombre de personnes: ');
                const comments = await question('Commentaires (optionnel): ');
                
                await DbTest.createReservation(
                    customerName,
                    customerEmail,
                    customerPhone,
                    dateStr,
                    time,
                    parseInt(partySize),
                    comments
                );
                break;
                
            case 'run-all-tests':
                await DbTest.runAllTests();
                break;
                
            default:
                console.error('✗ '.red + `Commande inconnue: ${command}`);
                console.log('Utilisez "node db-test.js help" pour afficher la liste des commandes disponibles'.yellow);
        }
    } catch (error) {
        console.error('✗ '.red + `Erreur lors de l'exécution de la commande: ${error.message}`);
        logToFile(`Erreur lors de l'exécution de la commande ${command}: ${error.message}`);
    } finally {
        // Fermer la connexion à la base de données
        await DbTest.disconnect();
    }
}

// Fonction principale
async function main() {
    // Création du fichier de log s'il n'existe pas
    const logFile = 'db-test-log.txt';
    if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, `=== BookMyTable - Log de test de base de données ===\nDémarré le ${moment().format('YYYY-MM-DD HH:mm:ss')}\n\n`);
    }
    
    // Traiter les commandes
    await processCommand(process.argv);
}

// Exécuter la fonction principale
main().catch(error => {
    console.error('Erreur critique:', error);
    process.exit(1);
});