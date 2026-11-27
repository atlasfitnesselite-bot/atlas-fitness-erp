import { useAuthStore } from '@/store/useAuthStore';
import api from '../../lib/api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Upload, User, MapPin, Phone, HeartPulse } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MemberRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    nationality: '',
    occupation: '',
    mobile: '',
    altMobile: '',
    email: '',
    branch: 'Main Branch',
    status: 'ACTIVE',
    addresses: [
      {
        type: 'HOME',
        addressLine: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      }
    ],
    emergencyContacts: [
      {
        name: '',
        relationship: '',
        mobile: '',
      }
    ],
    reference: {
      referredBy: '',
      leadSource: '',
    }
  });

  const [initialLoading, setInitialLoading] = useState(!!id);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (!id) {
      api.get('/api/subscriptions/plans').then((res) => {
        const list = res.data?.plans || res.data || [];
        if (Array.isArray(list)) setPlans(list);
      }).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchMember = async () => {
        try {
          const res = await api.get(`/api/members/${id}`);
          if (res.data) {
            const data = res.data;
            if (data.dateOfBirth) {
               data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split('T')[0];
            }
            if (!data.addresses || data.addresses.length === 0) {
              data.addresses = [{ type: 'HOME', addressLine: '', city: '', state: '', country: '', postalCode: '' }];
            }
            if (!data.emergencyContacts || data.emergencyContacts.length === 0) {
              data.emergencyContacts = [{ name: '', relationship: '', mobile: '' }];
            }
            if (!data.reference) {
              data.reference = { referredBy: '', leadSource: '' };
            }
            // Merge existing data with defaults
            setFormData(prev => ({
              ...prev,
              ...data,
              // ensure arrays and objects are fully merged
              addresses: data.addresses,
              emergencyContacts: data.emergencyContacts,
              reference: data.reference
            }));
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to load member data", variant: "destructive" });
        } finally {
          setInitialLoading(false);
        }
      };
      fetchMember();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Security: Restrict mobile fields to numbers only and max 10 digits
    if ((name === 'mobile' || name === 'altMobile') && value !== '') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleAddressChange = (e) => {
    const newAddresses = [...formData.addresses];
    newAddresses[0][e.target.name] = e.target.value;
    setFormData({ ...formData, addresses: newAddresses });
  };

  const handleEmergencyChange = (e) => {
    const newEmergency = [...formData.emergencyContacts];
    newEmergency[0][e.target.name] = e.target.value;
    setFormData({ ...formData, emergencyContacts: newEmergency });
  };

  const handleReferenceChange = (e) => {
    setFormData({
      ...formData,
      reference: {
        ...formData.reference,
        [e.target.name]: e.target.value
      }
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const diff_ms = Date.now() - new Date(dob).getTime();
    const age_dt = new Date(diff_ms); 
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.mobile && formData.mobile.length !== 10) {
      toast({ title: "Validation Error", description: "Mobile number must be exactly 10 digits", variant: "destructive" });
      return;
    }
    if (formData.altMobile && formData.altMobile.length !== 10) {
      toast({ title: "Validation Error", description: "Alternate mobile number must be exactly 10 digits", variant: "destructive" });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+?/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast({ title: "Validation Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      // Clean up empty objects
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.addresses[0].addressLine) dataToSubmit.addresses = undefined;
      if (!dataToSubmit.emergencyContacts[0].name) dataToSubmit.emergencyContacts = undefined;
      if (!dataToSubmit.reference.leadSource && !dataToSubmit.reference.referredBy) dataToSubmit.reference = undefined;

      // Make sure DOB is valid ISO string
      if (dataToSubmit.dateOfBirth) {
        dataToSubmit.dateOfBirth = new Date(dataToSubmit.dateOfBirth).toISOString();
      } else {
        delete dataToSubmit.dateOfBirth;
      }

      let res;
      if (id) {
        res = await api.put(`/api/members/${id}`, dataToSubmit);
      } else {
        res = await api.post('/api/members', dataToSubmit);
      }
      
      const data = res.data;
      
      if (!data) {
        throw new Error(`Failed to ${id ? 'update' : 'register'} member`);
      }

      toast({
        title: "Success",
        description: `Member ${data.memberId || ''} ${id ? 'updated' : 'registered'} successfully!`,
      });
      navigate(`/members/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to register member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/members')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{id ? 'Edit Member Profile' : 'New Member Registration'}</h1>
            <p className="text-muted-foreground">{id ? 'Update member details.' : 'Add a new member to the directory.'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/members')}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || initialLoading}>
            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : (id ? 'Update Member' : 'Save Member')}
          </Button>
        </div>
      </div>

      {initialLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading member data...</div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Basic details about the member.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" required value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" required value={formData.lastName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Age (Auto-calculated)</Label>
              <Input disabled value={calculateAge(formData.dateOfBirth)} className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}>
                <SelectTrigger id="bloodGroup">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Contact Information
            </CardTitle>
            <CardDescription>How to reach the member.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input id="mobile" name="mobile" required value={formData.mobile} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altMobile">Alternate Mobile (Optional)</Label>
              <Input id="altMobile" name="altMobile" placeholder="Optional" value={formData.altMobile} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Address Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine">Address Line</Label>
              <Input id="addressLine" name="addressLine" value={formData.addresses[0].addressLine} onChange={handleAddressChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={formData.addresses[0].city} onChange={handleAddressChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input id="state" name="state" value={formData.addresses[0].state} onChange={handleAddressChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={formData.addresses[0].country} onChange={handleAddressChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" name="postalCode" value={formData.addresses[0].postalCode} onChange={handleAddressChange} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="em_name">Contact Name</Label>
                <Input id="em_name" name="name" value={formData.emergencyContacts[0].name} onChange={handleEmergencyChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em_rel">Relationship</Label>
                <Input id="em_rel" name="relationship" value={formData.emergencyContacts[0].relationship} onChange={handleEmergencyChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em_mob">Mobile Number</Label>
                <Input id="em_mob" name="mobile" value={formData.emergencyContacts[0].mobile} onChange={handleEmergencyChange} />
              </div>
            </CardContent>
          </Card>

          {/* Fitness & Tax Details (from legacy form) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Fitness &amp; Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" name="height" placeholder="e.g. 5'10 or 178cm" value={formData.height || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" placeholder="e.g. 75kg" value={formData.weight || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="workoutType">Workout Type</Label>
                <Input id="workoutType" name="workoutType" placeholder="e.g. Strength, Cardio, Crossfit" value={formData.workoutType || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GSTIN (B2B Optional)</Label>
                <Input id="gstNumber" name="gstNumber" placeholder="Member GSTIN" value={formData.gstNumber || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN (Optional)</Label>
                <Input id="panNumber" name="panNumber" placeholder="Member PAN" value={formData.panNumber || ''} onChange={handleChange} />
              </div>
              {!id && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="planId">Initial Membership Plan (Optional)</Label>
                    <select
                      id="planId"
                      name="planId"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.planId || ''}
                      onChange={handleChange}
                    >
                      <option value="">No Plan / Assign Later</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.durationInMonths}m - ₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planStartDate">Plan Start Date</Label>
                    <Input
                      id="planStartDate"
                      name="planStartDate"
                      type="date"
                      value={formData.planStartDate || new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reference & Lead Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Reference & Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source</Label>
                <select 
                  id="leadSource" 
                  name="leadSource" 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.reference.leadSource} 
                  onChange={handleReferenceChange}
                >
                  <option value="">Select Source</option>
                  <option value="Walk In">Walk In</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Website">Website</option>
                  <option value="Friend">Friend</option>
                  <option value="Google">Google</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referredBy">Referred By</Label>
                <Input id="referredBy" name="referredBy" placeholder="Member Name or ID" value={formData.reference.referredBy} onChange={handleReferenceChange} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
      )}
    </div>
  );
};

export default MemberRegistration;
